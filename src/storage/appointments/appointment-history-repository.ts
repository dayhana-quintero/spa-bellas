import type { Appointment } from '@/shared/types/appointment';
import { readSpaData } from '@/storage/spa-store';

type AppointmentHistoryFilters = {
  status?: Appointment['status'];
  from?: Date;
  to?: Date;
  clientId?: string;
  serviceId?: string;
  page?: number;
  pageSize?: number;
};

type AppointmentHistoryPage = {
  items: Appointment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function findAppointmentHistory(
  filters: AppointmentHistoryFilters,
): AppointmentHistoryPage {
  const allAppointments = readSpaData().appointments;

  let data: Appointment[] = allAppointments;

  if (filters.status) {
    const status = filters.status;
    data = data.filter((app) => app.status === status);
  }

  if (filters.from) {
    const fromDate = filters.from;
    data = data.filter((app) => app.scheduledStart >= fromDate);
  }

  if (filters.to) {
    const toDate = filters.to;
    data = data.filter((app) => app.scheduledStart <= toDate);
  }

  if (filters.clientId) {
    const clientId = filters.clientId;
    data = data.filter((app) => app.clientId === clientId);
  }

  if (filters.serviceId) {
    const serviceId = filters.serviceId;
    data = data.filter((app) => app.serviceId === serviceId);
  }

  // Orden descendente: la cita mas reciente primero.
  data = [...data].sort(
    (a, b) => b.scheduledStart.getTime() - a.scheduledStart.getTime(),
  );

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize) || 0;

  const startIndex = (page - 1) * pageSize;
  const items = data.slice(startIndex, startIndex + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}