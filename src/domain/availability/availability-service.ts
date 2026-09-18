import { generateAvailableSlots, type AvailableSlot } from './generate-available-slots';

type AvailabilityServiceInput = {
  date: string;
  serviceDurationMinutes: number;
  availability: {
    spaCapacity: number;
    bufferBetweenAppointments: number;
    defaultHoldDuration: number;
    workingDays: Array<'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'>;
    nonWorkingDays: Date[];
    openingHours: Partial<Record<'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo', { opensAt: number; closesAt: number }>>;
    adminBlocks: Array<{ startsAt: Date; endsAt: Date; reason?: string }>;
    professionalAvailability?: unknown;
  };
  bookedAppointments: Array<{ scheduledStart: Date; scheduledEnd: Date }>;
  pendingHolds: Array<{ scheduledStart: Date; scheduledEnd: Date }>;
};

export function getAvailableSlotsForDate(input: AvailabilityServiceInput): AvailableSlot[] {
  return generateAvailableSlots(input);
}
