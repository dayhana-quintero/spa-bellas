'use client';

import { useEffect, useState } from 'react';

import type { AppointmentRequest } from '@/domain/appointments/create-appointment-request';
import type { Service } from '@/shared/types/service';
import {
  readCustomerSession,
  saveCustomerSession,
} from './appointment-request-form';
import AppointmentRequestConfirmation from './appointment-request-confirmation';
import AppointmentRequestForm from './appointment-request-form';
import AppointmentSlotPicker from './slot-picker';

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
    <div className="mt-8 space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              aria-pressed={selectedServiceId === service.id}
              onClick={() => {
                setSelectedServiceId(service.id);
                setSelectedSlot('');
              }}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                selectedServiceId === service.id
                  ? 'border-brand bg-brand-soft text-foreground'
                  : 'border-line bg-surface text-body'
              }`}
            >
              {service.name}
            </button>
          ))}
        </div>
      </section>

      <AppointmentSlotPicker
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

      <AppointmentRequestForm
        key={submittedRequest?.id ?? 'nueva-solicitud'}
        service={selectedService}
        date={date}
        selectedSlot={selectedSlot}
        onRequestCreated={handleRequestCreated}
      />
    </div>
  );
}
