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
  /**
   * Presentacion: `card` (panel administrativo) o `steps` (reserva publica,
   * bloques numerados 2-Dia y 3-Hora al estilo del flujo guiado).
   */
  variant?: 'card' | 'steps';
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

const stepCircleClass =
  'grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-pink text-sm font-bold text-on-pink';
const stepTitleClass = 'self-center text-base font-bold text-foreground';

export default function AppointmentSlotPicker({
  service,
  serviceId,
  date,
  selectedSlot,
  onDateChange,
  onSlotChange,
  slotsEndpoint,
  variant = 'card',
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

  const statusMessageElement = state.statusMessage ? (
    <p className="flex items-start gap-3 rounded-2xl border border-amber/50 bg-amber-soft px-4 py-3.5 text-sm font-medium text-amber-text">
      <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden="true">ⓘ</span>
      <span>{state.statusMessage}</span>
    </p>
  ) : null;

  const slotsGrid = state.hasAvailableSlots ? (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {slots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          aria-pressed={selectedSlot === slot.time}
          onClick={() => onSlotChange(slot.time)}
          className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
            selectedSlot === slot.time
              ? 'border-brand bg-brand-soft text-foreground shadow-sm'
              : 'border-line bg-surface-inset text-foreground hover:border-brand'
          }`}
        >
          <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">Hora</span>
          <span className="mt-2 block text-lg font-semibold">{slot.time}</span>
        </button>
      ))}
    </div>
  ) : null;

  const stepsSlotsGrid = state.hasAvailableSlots ? (
    <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {slots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          aria-pressed={selectedSlot === slot.time}
          onClick={() => onSlotChange(slot.time)}
          className={`min-h-11 rounded-xl border px-4 py-2.5 text-left transition ${
            selectedSlot === slot.time
              ? 'border-pink-deep bg-pink text-on-pink'
              : 'border-line bg-surface text-foreground hover:border-pink-deep hover:bg-pink-soft'
          }`}
        >
          <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
            Hora
          </span>
          <span className="mt-0.5 block text-base font-semibold">{slot.time}</span>
        </button>
      ))}
    </div>
  ) : null;

  if (variant === 'steps') {
    return (
      <div className="mt-7 space-y-7">
        <section aria-label="Paso 2: día" className="grid grid-cols-[34px_minmax(0,1fr)] gap-x-4 gap-y-2">
          <span aria-hidden className={stepCircleClass}>2</span>
          <h2 className={stepTitleClass}>Día</h2>
          <div className="col-start-2">
            <label className="block text-sm font-medium text-foreground" htmlFor="slot-date">
              Fecha de la cita
              <input
                id="slot-date"
                type="date"
                value={date}
                onChange={(event) => onDateChange(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-foreground outline-none transition focus:border-pink-deep"
              />
            </label>
          </div>
        </section>

        <section aria-label="Paso 3: hora" className="grid grid-cols-[34px_minmax(0,1fr)] gap-x-4 gap-y-2">
          <span aria-hidden className={stepCircleClass}>3</span>
          <h2 className={stepTitleClass}>Hora</h2>
          <div className="col-start-2">
            {statusMessageElement}
            {stepsSlotsGrid}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <label className="flex-1 text-sm font-medium text-foreground" htmlFor="slot-date">
          Fecha de la cita
          <input
            id="slot-date"
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-surface-inset px-3 py-2.5 text-foreground outline-none ring-0 transition focus:border-brand"
          />
        </label>

        {service ? (
          <div className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-body">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Servicio
            </span>
            <span className="mt-1 block font-medium text-foreground">{service.name}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        {statusMessageElement}
        {slotsGrid}
      </div>
    </div>
  );
}
