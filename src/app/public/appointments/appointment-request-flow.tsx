'use client';

import { useEffect, useState } from 'react';

import type { AppointmentRequest } from '@/domain/appointments/create-appointment-request';
import type { Service } from '@/shared/types/service';
import { formatDuration } from '@/shared/format-duration';
import {
  readCustomerSession,
  saveCustomerSession,
} from './appointment-request-form';
import AppointmentRequestConfirmation from './appointment-request-confirmation';
import AppointmentRequestForm from './appointment-request-form';
import AppointmentRequestToast from './appointment-request-toast';
import AppointmentSlotPicker from './slot-picker';

const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;

export function formatDayLabel(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return `${DAYS[parsed.getDay()]} ${parsed.getDate()} ${MONTHS[parsed.getMonth()]}`;
}

const stepCircleClass =
  'grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-pink text-sm font-bold text-on-pink';
const stepTitleClass = 'self-center text-base font-bold text-foreground';

type BookingSummaryCardProps = {
  service?: Service;
  date: string;
  selectedSlot: string;
};

function BookingSummaryCard({ service, date, selectedSlot }: BookingSummaryCardProps) {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Servicio', value: service?.name ?? 'Sin elegir' },
    { label: 'Día', value: date ? formatDayLabel(date) : 'Sin elegir' },
    { label: 'Hora', value: selectedSlot || 'Sin elegir' },
    { label: 'Duración', value: service ? formatDuration(service.estimatedDuration ?? 60) : '—' },
  ];

  return (
    <aside
      aria-label="Resumen de tu cita"
      className="rounded-[18px] border border-line bg-gradient-to-br from-brand-soft to-surface p-6 shadow-sm lg:sticky lg:top-24"
    >
      <h2 className="font-display text-[28px] font-semibold leading-none text-cherry">Tu cita</h2>

      <dl className="my-4 grid gap-2.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between gap-3 border-b border-line pb-2.5 text-sm last:border-b-0"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-sm text-muted-foreground">Total</span>
        <b className="font-display text-[34px] font-semibold leading-none">
          {service?.priceDisplay ?? '$0'}
        </b>
      </div>

      <small className="mt-4 block text-center text-xs text-muted-foreground">
        No pagas ahora. Te escribiremos para confirmar.
      </small>
    </aside>
  );
}

export default function AppointmentRequestFlow() {
  const persistedSession = readCustomerSession();
  const [services, setServices] = useState<Service[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(persistedSession.selectedServiceId ?? services[0]?.id ?? '');
  const [date, setDate] = useState<string>(persistedSession.date ?? '');
  const [selectedSlot, setSelectedSlot] = useState(persistedSession.selectedSlot ?? '');
  const [submittedRequest, setSubmittedRequest] = useState<AppointmentRequest | null>(null);

  useEffect(() => {
    let active = true;

    // Al llegar desde una tarjeta de servicio (?serviceId=...) se preselecciona
    // ese servicio para no tener que buscarlo de nuevo en este paso.
    const serviceIdFromUrl = new URLSearchParams(window.location.search).get('serviceId');
    if (serviceIdFromUrl?.trim()) {
      setSelectedServiceId(serviceIdFromUrl.trim());
    }

    fetch('/api/public/services')
      .then(async (response) => {
        if (!response.ok) throw new Error('No se pudieron cargar los servicios.');
        return (await response.json()) as Service[];
      })
      .then((catalog) => {
        if (!active) return;
        setServices(catalog);
        setSelectedServiceId((current) => catalog?.some((service) => service.id === current) ? current : catalog[0]?.id ?? '');
      })
      .catch(() => {
        if (active) setServices([]);
      })
      .finally(() => {
        if (active) setCatalogLoaded(true);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    saveCustomerSession({ selectedServiceId, date, selectedSlot });
  }, [selectedServiceId, date, selectedSlot]);

  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0];

  // Al crear la cita se limpia la seleccion (servicio, fecha y horario) para que
  // la siguiente reserva empiece desde cero, y el formulario se remonta vacio.
  function handleRequestCreated(request: AppointmentRequest) {
    setSubmittedRequest(request);
    setSelectedServiceId(services[0]?.id ?? '');
    setDate('');
    setSelectedSlot('');
  }

  if (services.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface/50 p-6 text-body">
        {catalogLoaded ? 'No hay servicios disponibles en este momento.' : 'Cargando servicios...'}
      </div>
    );
  }

  return (
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <AppointmentRequestToast request={submittedRequest} />

      <div className="rounded-[18px] border border-line bg-surface p-6 shadow-sm md:p-7">
        <section aria-label="Paso 1: servicio" className="grid grid-cols-[34px_minmax(0,1fr)] gap-x-4 gap-y-2">
          <span aria-hidden className={stepCircleClass}>1</span>
          <h2 className={stepTitleClass}>Servicio</h2>
          <div className="col-start-2 flex flex-wrap gap-2">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                aria-pressed={selectedServiceId === service.id}
                onClick={() => {
                  setSelectedServiceId(service.id);
                  setSelectedSlot('');
                }}
                className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selectedServiceId === service.id
                    ? 'border-pink-deep bg-pink text-on-pink'
                    : 'border-line bg-surface text-body hover:border-pink-deep hover:bg-pink-soft'
                }`}
              >
                {service.name}
              </button>
            ))}
          </div>
        </section>

        <AppointmentSlotPicker
          variant="steps"
          service={selectedService}
          serviceId={selectedService?.id ?? selectedServiceId}
          date={date}
          selectedSlot={selectedSlot}
          onDateChange={setDate}
          onSlotChange={setSelectedSlot}
        />

        {submittedRequest ? (
          <AppointmentRequestConfirmation request={submittedRequest} />
        ) : null}

        <section aria-label="Paso 4: tus datos" className="mt-7 grid grid-cols-[34px_minmax(0,1fr)] gap-x-4 gap-y-2">
          <span aria-hidden className={stepCircleClass}>4</span>
          <h2 className={stepTitleClass}>Tus datos</h2>
          <div className="col-start-2">
            <AppointmentRequestForm
              key={submittedRequest?.id ?? 'nueva-solicitud'}
              service={selectedService}
              date={date}
              selectedSlot={selectedSlot}
              onRequestCreated={handleRequestCreated}
            />
          </div>
        </section>
      </div>

      <BookingSummaryCard service={selectedService} date={date} selectedSlot={selectedSlot} />
    </div>
  );
}
