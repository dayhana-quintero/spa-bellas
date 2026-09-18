type DayKey =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

type AvailabilityInput = {
  date: string;
  serviceDurationMinutes: number;
  availability: {
    spaCapacity: number;
    bufferBetweenAppointments: number;
    defaultHoldDuration: number;
    workingDays: DayKey[];
    nonWorkingDays: Date[];
    openingHours: Partial<Record<DayKey, { opensAt: number; closesAt: number }>>;
    adminBlocks: Array<{ startsAt: Date; endsAt: Date; reason?: string }>;
    professionalAvailability?: unknown;
  };
  bookedAppointments: Array<{ scheduledStart: Date; scheduledEnd: Date }>;
  pendingHolds: Array<{ scheduledStart: Date; scheduledEnd: Date }>;
};

export type AvailableSlot = {
  date: string;
  time: string;
  available: boolean;
  capacity: number;
};

const dayNames: Record<number, DayKey> = {
  0: 'domingo',
  1: 'lunes',
  2: 'martes',
  3: 'miercoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sabado',
};

function toDayKey(date: Date): DayKey {
  return dayNames[date.getDay()];
}

export function generateAvailableSlots({
  date,
  serviceDurationMinutes,
  availability,
  bookedAppointments,
  pendingHolds,
}: AvailabilityInput): AvailableSlot[] {
  const dayDate = new Date(`${date}T00:00:00`);
  const dayKey = toDayKey(dayDate);

  if (!availability.workingDays.includes(dayKey)) {
    return [];
  }

  const rules = availability.openingHours[dayKey];
  if (!rules) {
    return [];
  }

  const isNonWorkingDate = availability.nonWorkingDays.some((blockedDay) => {
    const blocked = new Date(blockedDay);
    return blocked.toDateString() === dayDate.toDateString();
  });

  if (isNonWorkingDate) {
    return [];
  }

  const slots: AvailableSlot[] = [];
  const startMinute = rules.opensAt;
  const endMinute = rules.closesAt;

  for (let minute = startMinute; minute + serviceDurationMinutes <= endMinute; minute += 30) {
    const slotStart = new Date(`${date}T${formatMinutes(minute)}:00`);
    const slotEnd = new Date(slotStart.getTime() + serviceDurationMinutes * 60 * 1000);

    const overlapsBooked = bookedAppointments.some((appointment) => {
      return slotStart < appointment.scheduledEnd && slotEnd > appointment.scheduledStart;
    });

    const overlapsHold = pendingHolds.some((hold) => {
      return slotStart < hold.scheduledEnd && slotEnd > hold.scheduledStart;
    });

    const overlapsBlock = availability.adminBlocks.some((block) => {
      return slotStart < block.endsAt && slotEnd > block.startsAt;
    });

    if (!overlapsBooked && !overlapsHold && !overlapsBlock) {
      slots.push({
        date,
        time: formatMinutes(minute),
        available: true,
        capacity: availability.spaCapacity,
      });
    }
  }

  return slots;
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
