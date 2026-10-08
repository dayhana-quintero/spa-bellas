import {
  RescheduleError,
  rescheduleAppointmentForAdmin,
  type RescheduleResult,
} from '@/domain/appointments/admin-reschedule-service';
import { prepareRescheduleNoticeMessage } from '@/integrations/whatsapp/whatsapp-confirmation';
import { appointmentStatusSchema } from '@/shared/types/appointment';
import { requireAdmin } from '../../../guard';

type RescheduleContext = {
  params: Promise<{ id: string }>;
};

type NoticeBlock = { available: true; messageText: string } | { available: false };

// Prepara el aviso con la nueva fecha solo si hay consentimiento (FR-010);
// cualquier fallo (p. ej. telefono invalido) deja el aviso sin ofrecer pero no
// afecta a la reprogramacion ya completada.
function buildNotice(
  appointmentId: string,
  candidate: RescheduleResult['noticeCandidate'],
): NoticeBlock {
  if (!candidate.consent) {
    return { available: false };
  }

  try {
    const prepared = prepareRescheduleNoticeMessage({
      appointmentId,
      clientName: candidate.clientName,
      phone: candidate.phone,
      serviceName: candidate.serviceName,
      previousStart: candidate.previousStart,
      nextStart: candidate.nextStart,
      consent: true,
    });
    return { available: true, messageText: prepared.messageText };
  } catch {
    return { available: false };
  }
}

const STATUS_BY_REASON: Record<string, number> = {
  'invalid-params': 400,
  'past-datetime': 400,
  'slot-unavailable': 409,
  'client-conflict': 409,
  'stale-appointment': 409,
  'status-not-allowed': 409,
};

// Mueve la cita a un nuevo horario. El servidor recalcula las fechas, revalida
// la disponibilidad y aplica la escritura condicional: cualquier rechazo deja
// la cita exactamente como estaba (spec 004, FR-004/FR-005/FR-006).
export async function POST(request: Request, context: RescheduleContext) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const body = (await request.json()) as {
      date?: string;
      slot?: string;
      expectedScheduledStart?: string;
      expectedStatus?: string;
      note?: string;
    };

    if (
      typeof body.date !== 'string' ||
      typeof body.slot !== 'string' ||
      typeof body.expectedStatus !== 'string' ||
      typeof body.expectedScheduledStart !== 'string'
    ) {
      return Response.json({ error: 'Parametros invalidos.' }, { status: 400 });
    }

    if (body.note !== undefined && typeof body.note !== 'string') {
      return Response.json({ error: 'Parametros invalidos.' }, { status: 400 });
    }

    const expectedScheduledStart = new Date(body.expectedScheduledStart);
    if (Number.isNaN(expectedScheduledStart.getTime())) {
      return Response.json({ error: 'Parametros invalidos.' }, { status: 400 });
    }

    const expectedStatus = appointmentStatusSchema.safeParse(body.expectedStatus);
    if (!expectedStatus.success) {
      return Response.json({ error: 'Parametros invalidos.' }, { status: 400 });
    }

    const result = await rescheduleAppointmentForAdmin({
      appointmentId: id,
      date: body.date,
      slot: body.slot,
      expectedScheduledStart,
      expectedStatus: expectedStatus.data,
      adminId: session.id,
      note: body.note,
    });

    return Response.json({
      appointment: result.appointment,
      statusRecord: result.statusRecord,
      notice: buildNotice(id, result.noticeCandidate),
    });
  } catch (error) {
    if (error instanceof RescheduleError) {
      return Response.json(
        { error: error.message, reason: error.reason },
        { status: STATUS_BY_REASON[error.reason] ?? 409 },
      );
    }

    const message = error instanceof Error ? error.message : 'No se pudo reprogramar la cita.';
    if (message === 'No autorizado') {
      return Response.json({ error: 'No autorizado.' }, { status: 401 });
    }
    return Response.json({ error: message }, { status: 400 });
  }
}
