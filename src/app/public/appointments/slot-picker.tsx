'use client';

import { useEffect, useState } from 'react';

import type { Service } from '@/shared/types/service';

type SlotPickerState = {
  hasAvailableSlots: boolean;
  statusMessage: string | null;
};

type AppointmentSlotPickerProps = {
  service?: Service;
  serviceId: string;
  date: string;
  selectedSlot: string;
  onDateChange: (value: string) => void;
  onSlotChange: (value: string) => void;
  /**
   * Endpoint personalizado para cargar los horarios. Por defecto se usa la
   * reserva publica; el panel de reprogramacion pasa el endpoint administrativo,
   * que excluye la propia cita del calculo de ocupacion.
   */
  slotsEndpoint?: string;
};

export function buildSlotPickerState({
  service,
  date,
  slots,
}: {
  service?: Service;
  date: string;
  slots: Array<{ time: string }>;
}): SlotPickerState {
  if (!service) {
    return {
      hasAvailableSlots: false,
      statusMessage: 'Servicio no disponible para agendar en este momento.',
    };
  }

  if (!date) {
    return {
      hasAvailableSlots: false,
      statusMessage: 'Selecciona una fecha para ver los horarios disponibles.',
    };
  }

  if (slots.length === 0) {
    return {
      hasAvailableSlots: false,
      statusMessage: `No hay horarios disponibles para ${date}. Prueba otra fecha o servicio.`,
    };
  }

  return {
    hasAvailableSlots: true,
    statusMessage: null,
  };
}

export default function AppointmentSlotPicker({
  service,
  serviceId,
  date,
  selectedSlot,
  onDateChange,
  onSlotChange,
  slotsEndpoint,
}: AppointmentSlotPickerProps) {
  const [slotData, setSlotData] = useState<{ key: string; slots: Array<{ time: string }> }>({ key: '', slots: [] });
  const requestKey = slotsEndpoint ?? `${serviceId}:${date}`;
  const slots = slotData.key === requestKey ? slotData.slots : [];

  useEffect(() => {
    if (!serviceId || !date) return;

    const endpoint =
      slotsEndpoint ??
      `/api/public/slots?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`;
    const controller = new AbortController();
    fetch(endpoint, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('No se pudieron cargar los horarios.');
        return (await response.json()) as Array<{ time: string }>;
      })
      .then((availableSlots) => setSlotData({ key: requestKey, slots: availableSlots }))
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setSlotData({ key: requestKey, slots: [] });
      });

    return () => controller.abort();
  }, [date, requestKey, serviceId, slotsEndpoint]);

  const state = buildSlotPickerState({
    service,
    date,
    slots,
  });

  useEffect(() => {
    if (selectedSlot && (slotData.key !== requestKey || !slotData.slots.some((slot) => slot.time === selectedSlot))) {
      onSlotChange('');
    }
  }, [onSlotChange, requestKey, selectedSlot, slotData]);

  return (
    <div className="rounded-3xl border border-[#e7d8d3] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <label className="flex-1 text-sm font-medium text-[#2f2b2b]" htmlFor="slot-date">
          Fecha de la cita
          <input
            id="slot-date"
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-[#d7c6c2] bg-[#fffaf9] px-3 py-2.5 text-[#1f1b1b] outline-none ring-0 transition focus:border-[#d56572]"
          />
        </label>

        {service ? (
          <div className="rounded-2xl bg-[#f8efee] px-4 py-3 text-sm text-[#4a4342]">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7d6966]">
              Servicio
            </span>
            <span className="mt-1 block font-medium text-[#2d2828]">{service.name}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        {state.statusMessage ? (
          <p className="rounded-2xl border border-dashed border-[#d7c6c2] bg-[#f9f4f2] px-4 py-3 text-sm text-[#4a4342]">
            {state.statusMessage}
          </p>
        ) : null}

        {state.hasAvailableSlots ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                aria-pressed={selectedSlot === slot.time}
                onClick={() => onSlotChange(slot.time)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                  selectedSlot === slot.time
                    ? 'border-[#d56572] bg-[#fcecf0] text-[#2d2828] shadow-sm'
                    : 'border-[#e3d5d1] bg-[#fffaf9] text-[#2d2828] hover:border-[#d56572]'
                }`}
              >
                <span className="block text-xs uppercase tracking-[0.18em] text-[#7d6966]">Hora</span>
                <span className="mt-2 block text-lg font-semibold">{slot.time}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
