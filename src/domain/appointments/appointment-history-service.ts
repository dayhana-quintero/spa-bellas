import { getSupabaseAdminClient } from '@/lib/supabase';
import {
  listAppointmentStatusHistoryFromSupabase,
  listAppointmentsFromSupabase,
  listWhatsAppCommunicationsFromSupabase,
} from '@/lib/supabase-data';
import type { Appointment } from '@/shared/types/appointment';
import {
  findAppointmentHistory as findHistory,
  paginateAppointments,
} from '@/storage/appointments/appointment-history-repository';
import { readSpaData } from '@/storage/spa-store';

export type AppointmentHistoryQuery = {
  status?: Appointment['status'];
  from?: Date | string;
  to?: Date | string;
  clientId?: string;
  serviceId?: string;
  page?: number;
  pageSize?: number;
};

// La cita con las relaciones (cliente/servicio) que trae Supabase.
export type AppointmentWithRelations = Appointment & {
  client?: { id: string; name: string } | undefined;
  service?: { id: string; name: string } | undefined;
};

export type AppointmentHistoryPage = {
  items: AppointmentWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AppointmentTimelineEntry = {
  id: string;
  kind: 'status' | 'whatsapp';
  title: string;
  description: string;
  timestamp: Date;
};

export type AppointmentDetail = {
  appointment: AppointmentWithRelations;
  clientName: string;
  serviceName: string;
  timeline: AppointmentTimelineEntry[];
};

type NormalizedHistoryQuery = {
  status?: Appointment['status'];
  from?: Date;
  to?: Date;
  clientId?: string;
  serviceId?: string;
  page?: number;
  pageSize?: number;
};

type StatusRecordLike = {
  id: string;
  previousStatus: string;
  newStatus: string;
  note?: string | null;
  changedAt: Date;
};

type CommunicationRecordLike = {
  id: string;
  outcome: string;
  outcomeNote?: string | null;
  messageText?: string | null;
  createdAt: Date;
};

function normalizeQuery(filters: AppointmentHistoryQuery): NormalizedHistoryQuery {
  return {
    ...filters,
    from: filters.from ? new Date(filters.from) : undefined,
    to: filters.to ? new Date(filters.to) : undefined,
  };
}

// Historial de cambios de estado y mensajes de WhatsApp, ordenado en el tiempo.
function buildTimeline(
  statusRecords: StatusRecordLike[],
  communicationRecords: CommunicationRecordLike[],
): AppointmentTimelineEntry[] {
  return [
    ...statusRecords.map((record) => ({
      id: record.id,
      kind: 'status' as const,
      title: `Cambio de estado: ${record.previousStatus} → ${record.newStatus}`,
      description: record.note ?? 'Sin nota asociada.',
      timestamp: record.changedAt,
    })),
    ...communicationRecords.map((record) => ({
      id: record.id,
      kind: 'whatsapp' as const,
      title: `WhatsApp: ${record.outcome}`,
      description: record.outcomeNote ?? record.messageText ?? 'Sin mensaje asociado.',
      timestamp: record.createdAt,
    })),
  ].sort((left, right) => left.timestamp.getTime() - right.timestamp.getTime());
}

// Consulta en Supabase (la fuente real de citas) con los filtros del historial.
async function findHistoryInSupabase(
  filters: NormalizedHistoryQuery,
): Promise<AppointmentHistoryPage> {
  const rows = await listAppointmentsFromSupabase({
    status: filters.status,
    from: filters.from?.toISOString(),
  });

  let data: AppointmentWithRelations[] = rows;

  if (filters.to) {
    const to = filters.to;
    data = data.filter((appointment) => appointment.scheduledStart <= to);
  }

  if (filters.clientId) {
    const clientId = filters.clientId;
    data = data.filter((appointment) => appointment.clientId === clientId);
  }

  if (filters.serviceId) {
    const serviceId = filters.serviceId;
    data = data.filter((appointment) => appointment.serviceId === serviceId);
  }

  // listAppointmentsFromSupabase ya responde ordenado de mas reciente a mas antigua.
  return paginateAppointments(data, filters.page ?? 1, filters.pageSize ?? 20);
}

export async function getAppointmentHistory(
  filters: AppointmentHistoryQuery,
): Promise<AppointmentHistoryPage> {
  const normalizedFilters = normalizeQuery(filters);

  if (!getSupabaseAdminClient()) {
    return findHistory(normalizedFilters);
  }

  try {
    return await findHistoryInSupabase(normalizedFilters);
  } catch (cause) {
    console.error('No se pudo consultar el historial en Supabase:', cause);
    return findHistory(normalizedFilters);
  }
}

export async function getAppointmentDetail(id: string): Promise<AppointmentDetail | null> {
  if (getSupabaseAdminClient()) {
    try {
      const appointments = await listAppointmentsFromSupabase({ id });
      const appointment = appointments[0];

      if (appointment) {
        const [statusRecords, communicationRecords] = await Promise.all([
          listAppointmentStatusHistoryFromSupabase(id),
          listWhatsAppCommunicationsFromSupabase(id),
        ]);

        return {
          appointment,
          clientName: appointment.client?.name ?? 'Cliente sin nombre',
          serviceName: appointment.service?.name ?? 'Servicio sin nombre',
          timeline: buildTimeline(statusRecords, communicationRecords),
        };
      }
    } catch (cause) {
      console.error('No se pudo consultar el detalle de la cita en Supabase:', cause);
    }
  }

  const data = readSpaData();
  const appointment = data.appointments.find((item) => item.id === id);

  if (!appointment) {
    return null;
  }

  return {
    appointment,
    clientName:
      data.clients.find((client) => client.id === appointment.clientId)?.name ??
      'Cliente sin nombre',
    serviceName:
      data.services.find((service) => service.id === appointment.serviceId)?.name ??
      'Servicio sin nombre',
    timeline: buildTimeline(
      data.statusRecords.filter((record) => record.appointmentId === id),
      data.communicationRecords.filter((record) => record.appointmentId === id),
    ),
  };
}
