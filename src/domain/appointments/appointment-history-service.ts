import { findAppointmentById } from '@/storage/appointments/in-memory-appointment-repository';
import { findAppointmentHistory as findHistory } from '@/storage/appointments/appointment-history-repository';
import type { Appointment } from '@/shared/types/appointment';

export type AppointmentHistoryQuery = {
  status?: Appointment['status'];
  from?: Date | string;
  to?: Date | string;
  clientId?: string;
  serviceId?: string;
  page?: number;
  pageSize?: number;
};

export type AppointmentHistoryPage = ReturnType<typeof findHistory>;

export function getAppointmentHistory(filters: AppointmentHistoryQuery): AppointmentHistoryPage {
  const normalizedFilters = {
    ...filters,
    from: filters.from ? new Date(filters.from) : undefined,
    to: filters.to ? new Date(filters.to) : undefined,
  };

  return findHistory(normalizedFilters);
}

export function getAppointmentDetail(id: string): Appointment | undefined {
  return findAppointmentById(id);
}
