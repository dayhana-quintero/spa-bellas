import type { WhatsAppCommunicationRecord } from '@/shared/types/whatsapp-communication';
import { recordAppointmentCommunicationForAdmin } from '@/integrations/whatsapp/whatsapp-communication';
import { requireAdmin } from '../../../guard';

type CommunicationsContext = {
  params: Promise<{ id: string }>;
};

// Registra un evento de WhatsApp (envio preparado o resultado manual) de la
// cita, siempre atribuido al administrador que tiene la sesion activa.
export async function POST(request: Request, context: CommunicationsContext) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const body = (await request.json()) as {
      messageText?: string;
      outcome?: WhatsAppCommunicationRecord['outcome'];
      outcomeNote?: string;
    };

    if (!body.outcome) {
      return Response.json({ error: 'Falta el resultado de la comunicacion.' }, { status: 400 });
    }

    const record = await recordAppointmentCommunicationForAdmin({
      appointmentId: id,
      messageText: body.messageText ?? '',
      outcome: body.outcome,
      outcomeNote: body.outcomeNote,
      adminId: session.id,
    });

    return Response.json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo registrar la comunicacion.';
    return Response.json(
      { error: message },
      { status: message === 'No autorizado' ? 401 : 400 },
    );
  }
}
