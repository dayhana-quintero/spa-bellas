import type { Appointment } from '@/shared/types/appointment';
import type { AppointmentStatus } from '@/domain/appointments/appointment-state-machine';
import type { Service } from '@/shared/types/service';
import type { Supply } from '@/shared/types/supply';
import type { SupplyMovement } from '@/shared/types/supply-movement';
import { createId, readSpaData, withSpaData } from '@/storage/spa-store';
import { canTransitionStatus } from '@/domain/appointments/appointment-state-machine';
import { validateServiceCatalog } from '@/domain/services/service-catalog-rules';
import { normalizePhone } from '@/shared/validation/phone';

const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const blockingStatuses = new Set<Appointment['status']>(['pendiente', 'confirmada', 'reprogramacion solicitada', 'reprogramada']);

type Slot = { time: string; startsAt: string; endsAt: string };

function dateAt(date: string, minutes: number): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day, Math.floor(minutes / 60), minutes % 60, 0, 0);
}

function isBlocking(appointment: Appointment, now = new Date()): boolean {
  return blockingStatuses.has(appointment.status) && !(appointment.status === 'pendiente' && appointment.holdExpiresAt && appointment.holdExpiresAt <= now);
}

export function getPublicServices(): Service[] {
  return readSpaData().services.filter((service) => service.isActive && service.isBookable);
}

export function getAvailableSlots(serviceId: string, date: string): Slot[] {
  const data = readSpaData();
  const service = data.services.find((item) => item.id === serviceId);
  if (!service?.estimatedDuration) return [];
  const day = days[new Date(`${date}T12:00:00`).getDay()];
  const hours = day ? data.availability.openingHours[day] : undefined;
  if (!day || !hours || !data.availability.workingDays.includes(day) || data.availability.nonWorkingDays.includes(date)) return [];
  const slots: Slot[] = [];
  const step = 15;
  const duration = service.estimatedDuration + data.availability.bufferBetweenAppointments;
  for (let start = hours.opensAt; start + duration <= hours.closesAt; start += step) {
    const startsAt = dateAt(date, start);
    const endsAt = new Date(startsAt.getTime() + duration * 60000);
    const blocked = data.availability.adminBlocks.some((block) => startsAt < new Date(block.endsAt) && endsAt > new Date(block.startsAt));
    const concurrent = data.appointments.filter((appointment) => isBlocking(appointment) && startsAt < appointment.scheduledEnd && endsAt > appointment.scheduledStart).length;
    if (!blocked && concurrent < data.availability.spaCapacity) {
      slots.push({ time: startsAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }), startsAt: startsAt.toISOString(), endsAt: new Date(startsAt.getTime() + service.estimatedDuration * 60000).toISOString() });
    }
  }
  return slots;
}

export type AppointmentRequestInput = { clientName: string; clientPhone: string; serviceId: string; date: string; startsAt: string; notes?: string; whatsappConsent: boolean };

export function requestAppointment(input: AppointmentRequestInput): Appointment {
  if (!input.clientName.trim() || !input.whatsappConsent) throw new Error('Completa el nombre y autoriza el contacto por WhatsApp.');
  const phone = normalizePhone(input.clientPhone);
  if (phone.replace(/\D/g, '').length < 10) throw new Error('Ingresa un telefono valido para WhatsApp.');
  const requestedStart = new Date(input.startsAt);
  const slot = getAvailableSlots(input.serviceId, input.date).find((item) => item.startsAt === requestedStart.toISOString());
  if (!slot) throw new Error('Ese horario ya no esta disponible. Selecciona otro horario.');
  return withSpaData((data) => {
    const service = data.services.find((item) => item.id === input.serviceId);
    if (!service?.isActive || !service.isBookable || !service.estimatedDuration) throw new Error('El servicio no esta disponible para agendar.');
    let client = data.clients.find((item) => item.phone === phone);
    if (!client) {
      client = { id: createId(), name: input.clientName.trim(), phone, whatsappConsent: true, createdAt: new Date() };
      data.clients.push(client);
    }
    const now = new Date();
    const appointment: Appointment = { id: createId(), clientId: client.id, serviceId: service.id, scheduledStart: requestedStart, scheduledEnd: new Date(slot.endsAt), status: 'pendiente', notes: input.notes?.trim() || undefined, source: 'publico', holdExpiresAt: new Date(now.getTime() + data.availability.defaultHoldDuration * 60000), createdAt: now, updatedAt: now };
    data.appointments.push(appointment);
    return appointment;
  });
}

export function expireHolds(now = new Date()): number {
  return withSpaData((data) => {
    let count = 0;
    data.appointments.forEach((appointment) => {
      if (appointment.status === 'pendiente' && appointment.holdExpiresAt && appointment.holdExpiresAt <= now) {
        appointment.status = 'vencida'; appointment.updatedAt = now; count += 1;
      }
    });
    return count;
  });
}

export function getAppointmentDetails(id: string) {
  const data = readSpaData();
  const appointment = data.appointments.find((item) => item.id === id);
  if (!appointment) return null;
  return { appointment, client: data.clients.find((item) => item.id === appointment.clientId) ?? null, service: data.services.find((item) => item.id === appointment.serviceId) ?? null, history: data.statusRecords.filter((item) => item.appointmentId === id).sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime()) };
}

export function listAppointments(filters: { status?: string; from?: string; to?: string; client?: string; service?: string } = {}) {
  expireHolds();
  const data = readSpaData();
  return data.appointments.filter((appointment) => {
    const client = data.clients.find((item) => item.id === appointment.clientId);
    const service = data.services.find((item) => item.id === appointment.serviceId);
    return (!filters.status || appointment.status === filters.status) && (!filters.from || appointment.scheduledStart >= new Date(filters.from)) && (!filters.to || appointment.scheduledStart <= new Date(`${filters.to}T23:59:59`)) && (!filters.client || client?.name.toLowerCase().includes(filters.client.toLowerCase())) && (!filters.service || service?.name.toLowerCase().includes(filters.service.toLowerCase()));
  }).sort((a, b) => b.scheduledStart.getTime() - a.scheduledStart.getTime()).map((appointment) => ({ ...appointment, client: data.clients.find((item) => item.id === appointment.clientId), service: data.services.find((item) => item.id === appointment.serviceId) }));
}

export function changeAppointmentStatus(id: string, nextStatus: AppointmentStatus, adminId: string, note?: string): Appointment {
  return withSpaData((data) => {
    const appointment = data.appointments.find((item) => item.id === id);
    if (!appointment) throw new Error('No se encontro la cita.');
    if (!canTransitionStatus(appointment.status, nextStatus)) throw new Error('Ese cambio de estado no esta permitido.');
    const previousStatus = appointment.status;
    appointment.status = nextStatus; appointment.updatedAt = new Date();
    data.statusRecords.push({ id: createId(), appointmentId: id, previousStatus, newStatus: nextStatus, changedByAdminId: adminId, changedAt: appointment.updatedAt, note });
    return appointment;
  });
}

export function saveService(input: Omit<Service, 'id'> & { id?: string }): Service {
  validateServiceCatalog(input);
  return withSpaData((data) => {
    const service: Service = { ...input, id: input.id ?? createId() };
    const index = data.services.findIndex((item) => item.id === service.id);
    if (index >= 0) data.services[index] = service; else data.services.push(service);
    return service;
  });
}

export function listServices(): Service[] { return readSpaData().services; }

export function listSupplies() { const data = readSpaData(); return data.supplies.map((supply) => ({ ...supply, isLowStock: supply.quantityAvailable <= supply.minimumThreshold, movements: data.supplyMovements.filter((movement) => movement.supplyId === supply.id) })); }

export function saveSupply(input: Omit<Supply, 'id'> & { id?: string }): Supply {
  if (input.quantityAvailable < 0) throw new Error('La cantidad inicial no puede ser negativa.');
  return withSpaData((data) => { const supply: Supply = { ...input, id: input.id ?? createId() }; const index = data.supplies.findIndex((item) => item.id === supply.id); if (index >= 0) data.supplies[index] = supply; else data.supplies.push(supply); return supply; });
}

export function recordSupplyMovement(input: { supplyId: string; type: SupplyMovement['type']; quantity: number; reason: string; adminId: string; allowsNegativeStock?: boolean }): SupplyMovement {
  if (!input.quantity || input.quantity <= 0 || input.reason.trim().length < 3) throw new Error('Indica una cantidad positiva y un motivo.');
  return withSpaData((data) => {
    const supply = data.supplies.find((item) => item.id === input.supplyId);
    if (!supply) throw new Error('No se encontro el insumo.');
    const direction = input.type === 'entrada' ? 1 : -1;
    const nextQuantity = supply.quantityAvailable + direction * input.quantity;
    if (nextQuantity < 0 && !input.allowsNegativeStock) throw new Error('El movimiento dejaria el inventario en negativo. Registra una excepcion explicita.');
    supply.quantityAvailable = nextQuantity;
    const movement: SupplyMovement = { id: createId(), ...input, createdAt: new Date() };
    data.supplyMovements.push(movement);
    return movement;
  });
}
