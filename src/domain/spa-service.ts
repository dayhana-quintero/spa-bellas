import type { Appointment } from '@/shared/types/appointment';
import type { AppointmentStatus } from '@/domain/appointments/appointment-state-machine';
import type { Service } from '@/shared/types/service';
import type { Supply } from '@/shared/types/supply';
import type { SupplyMovement } from '@/shared/types/supply-movement';
import { createId } from '@/shared/id';
import { canTransitionStatus } from '@/domain/appointments/appointment-state-machine';
import { validateServiceCatalog } from '@/domain/services/service-catalog-rules';
import {
  findClientByPhoneFromSupabase,
  getAvailabilitySettingsFromSupabase,
  getServiceFromSupabase,
  listAppointmentStatusHistoryFromSupabase,
  listAppointmentsFromSupabase,
  listServicesFromSupabase,
  listSuppliesFromSupabase,
  listWhatsAppCommunicationsFromSupabase,
  recordSupplyMovementToSupabase,
  saveAppointmentToSupabase,
  saveClientToSupabase,
  saveServiceToSupabase,
  saveSupplyToSupabase,
  updateAppointmentStatusInSupabase,
} from '@/lib/supabase-data';
import { normalizePhone } from '@/shared/validation/phone';

const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const blockingStatuses = new Set<Appointment['status']>([
  'pendiente',
  'confirmada',
  'reprogramacion solicitada',
  'reprogramada',
]);

type Slot = { time: string; startsAt: string; endsAt: string };

function dateAt(date: string, minutes: number): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day, Math.floor(minutes / 60), minutes % 60, 0, 0);
}

function isBlocking(appointment: Appointment, now = new Date()): boolean {
  return (
    blockingStatuses.has(appointment.status) &&
    !(appointment.status === 'pendiente' && appointment.holdExpiresAt && appointment.holdExpiresAt <= now)
  );
}

export async function getPublicServices(): Promise<Service[]> {
  return listServicesFromSupabase({ publicOnly: true });
}

export async function getAvailableSlots(
  serviceId: string,
  date: string,
  options: { excludeAppointmentId?: string; excludePast?: boolean } = {},
): Promise<Slot[]> {
  const [availability, service, appointments] = await Promise.all([
    getAvailabilitySettingsFromSupabase(),
    getServiceFromSupabase(serviceId),
    listAppointmentsFromSupabase({ from: `${date}T00:00:00.000Z`, to: date }),
  ]);

  if (!service?.estimatedDuration) return [];

  const day = days[new Date(`${date}T12:00:00`).getDay()];
  const hours = day ? availability.openingHours[day] : undefined;
  if (!day || !hours || !availability.workingDays.includes(day) || availability.nonWorkingDays.includes(date)) {
    return [];
  }

  const slots: Slot[] = [];
  const step = 15;
  const duration = service.estimatedDuration + availability.bufferBetweenAppointments;
  const now = Date.now();

  for (let start = hours.opensAt; start + duration <= hours.closesAt; start += step) {
    const startsAt = dateAt(date, start);
    const endsAt = new Date(startsAt.getTime() + duration * 60000);

    // La reprogramacion no ofrece horas que ya pasaron (FR-003); la reserva
    // publica conserva su comportamiento actual.
    if (options.excludePast && startsAt.getTime() <= now) continue;

    const blocked = availability.adminBlocks.some(
      (block) => startsAt < new Date(block.endsAt) && endsAt > new Date(block.startsAt),
    );
    const concurrent = appointments.filter(
      (appointment) =>
        // La cita que se esta reprogramando no debe contarse a si misma como ocupacion.
        appointment.id !== options.excludeAppointmentId &&
        isBlocking(appointment) &&
        startsAt < appointment.scheduledEnd &&
        endsAt > appointment.scheduledStart,
    ).length;

    if (!blocked && concurrent < availability.spaCapacity) {
      slots.push({
        time: startsAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
        startsAt: startsAt.toISOString(),
        endsAt: new Date(startsAt.getTime() + service.estimatedDuration * 60000).toISOString(),
      });
    }
  }

  return slots;
}

export type AppointmentRequestInput = {
  clientName: string;
  clientPhone: string;
  serviceId: string;
  date: string;
  startsAt: string;
  notes?: string;
  whatsappConsent: boolean;
};

export async function requestAppointment(input: AppointmentRequestInput): Promise<Appointment> {
  if (!input.clientName.trim() || !input.whatsappConsent) {
    throw new Error('Completa el nombre y autoriza el contacto por WhatsApp.');
  }

  const phone = normalizePhone(input.clientPhone);
  if (phone.replace(/\D/g, '').length < 10) {
    throw new Error('Ingresa un telefono valido para WhatsApp.');
  }

  const requestedStart = new Date(input.startsAt);
  const slots = await getAvailableSlots(input.serviceId, input.date);
  const slot = slots.find((item) => item.startsAt === requestedStart.toISOString());
  if (!slot) {
    throw new Error('Ese horario ya no esta disponible. Selecciona otro horario.');
  }

  const service = await getServiceFromSupabase(input.serviceId);
  if (!service || !service.isActive || !service.isBookable || !service.estimatedDuration) {
    throw new Error('El servicio no esta disponible para agendar.');
  }

  let client = await findClientByPhoneFromSupabase(phone);
  if (!client) {
    const newClientId = createId();
    const saved = await saveClientToSupabase({
      id: newClientId,
      name: input.clientName.trim(),
      phone,
      whatsappConsent: true,
    });
    if (!saved) {
      throw new Error('No se pudo guardar el cliente en Supabase.');
    }
    client = {
      id: newClientId,
      name: input.clientName.trim(),
      phone,
      email: undefined,
      notes: undefined,
      whatsappConsent: true,
      createdAt: new Date(),
    };
  }

  const availability = await getAvailabilitySettingsFromSupabase();
  const now = new Date();

  const appointment: Appointment = {
    id: createId(),
    clientId: client.id,
    serviceId: service.id,
    scheduledStart: requestedStart,
    scheduledEnd: new Date(slot.endsAt),
    status: 'pendiente',
    notes: input.notes?.trim() || undefined,
    source: 'publico',
    holdExpiresAt: new Date(now.getTime() + availability.defaultHoldDuration * 60000),
    previousAppointmentId: undefined,
    createdAt: now,
    updatedAt: now,
  };

  const saved = await saveAppointmentToSupabase(appointment);
  if (!saved) {
    throw new Error('No se pudo guardar la cita en Supabase.');
  }

  return appointment;
}

export async function listAppointmentsForAdmin(
  filters: { status?: string; from?: string; to?: string; client?: string; service?: string } = {},
) {
  return listAppointmentsFromSupabase(filters);
}

export async function getAppointmentDetailsForAdmin(id: string) {
  const [appointments, history, communicationRecords] = await Promise.all([
    listAppointmentsFromSupabase({ id }),
    listAppointmentStatusHistoryFromSupabase(id),
    listWhatsAppCommunicationsFromSupabase(id),
  ]);
  const appointment = appointments[0];
  if (!appointment) return null;

  return {
    appointment,
    client: appointment.client ?? null,
    service: appointment.service ?? null,
    history,
    communicationRecords,
  };
}

export async function changeAppointmentStatusForAdmin(
  id: string,
  nextStatus: AppointmentStatus,
  adminId: string,
  note?: string,
) {
  const detail = await getAppointmentDetailsForAdmin(id);
  if (!detail) {
    throw new Error('No se encontro la cita.');
  }
  if (!canTransitionStatus(detail.appointment.status, nextStatus)) {
    throw new Error('Ese cambio de estado no esta permitido.');
  }

  const updated = await updateAppointmentStatusInSupabase({
    appointmentId: id,
    previousStatus: detail.appointment.status,
    newStatus: nextStatus,
    adminId,
    note,
  });

  return { ...detail.appointment, status: updated.status, updatedAt: updated.updatedAt };
}

export async function saveService(input: Omit<Service, 'id'> & { id?: string }): Promise<Service> {
  validateServiceCatalog(input);

  const saved = await saveServiceToSupabase({
    id: input.id,
    name: input.name,
    category: input.category,
    description: input.description,
    durationMinutes: input.estimatedDuration ?? 60,
    priceDisplay: input.priceDisplay,
    isActive: input.isActive,
    isBookable: input.isBookable,
  });

  return {
    id: saved.id,
    category: saved.category,
    name: saved.name,
    description: saved.description,
    estimatedDuration: saved.durationMinutes,
    priceDisplay: saved.priceDisplay,
    isActive: saved.isActive,
    isBookable: saved.isBookable,
  };
}

export async function listServices(): Promise<Service[]> {
  return listServicesFromSupabase();
}

export async function listSupplies() {
  return listSuppliesFromSupabase();
}

export async function saveSupply(input: Omit<Supply, 'id'> & { id?: string }): Promise<Supply> {
  if (input.quantityAvailable < 0) {
    throw new Error('La cantidad inicial no puede ser negativa.');
  }
  return saveSupplyToSupabase(input);
}

export async function recordSupplyMovement(input: {
  supplyId: string;
  type: SupplyMovement['type'];
  quantity: number;
  reason: string;
  adminId: string;
  allowsNegativeStock?: boolean;
}): Promise<SupplyMovement> {
  if (!input.quantity || input.quantity <= 0 || input.reason.trim().length < 3) {
    throw new Error('Indica una cantidad positiva y un motivo.');
  }
  return recordSupplyMovementToSupabase(input);
}