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

  if (services.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-[#d7c6c2] bg-white/50 p-6 text-[#564d4c]">
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
                  ? 'border-[#d56572] bg-[#fcecf0] text-[#2d2828]'
                  : 'border-[#e7d8d3] bg-white text-[#4a4342]'
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
      ) : (
        <AppointmentRequestForm
          service={selectedService}
          date={date}
          selectedSlot={selectedSlot}
          onRequestCreated={setSubmittedRequest}
        />
      )}
    </div>
  );
}
