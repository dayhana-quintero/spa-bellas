import { describe, expect, it } from 'vitest';

import { buildSlotPickerState } from '../../../src/app/public/appointments/slot-picker';

describe('slot picker state', () => {
  it('returns a clear empty state when there are no slots for the selected date', () => {
    const state = buildSlotPickerState({
      service: {
        id: 'service-1',
        name: 'Limpieza facial',
        category: 'Faciales',
        description: 'Tratamiento de limpieza facial.',
        estimatedDuration: 60,
        priceDisplay: '$120.000',
        isActive: true,
        isBookable: true,
      },
      date: '2026-09-24',
      slots: [],
    });

    expect(state.hasAvailableSlots).toBe(false);
    expect(state.statusMessage).toContain('No hay horarios disponibles');
  });

  it('signals unavailability when the selected service is missing', () => {
    const state = buildSlotPickerState({
      service: undefined,
      date: '2026-09-24',
      slots: [],
    });

    expect(state.hasAvailableSlots).toBe(false);
    expect(state.statusMessage).toContain('Servicio no disponible');
  });
});
