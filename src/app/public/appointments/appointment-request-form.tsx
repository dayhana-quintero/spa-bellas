'use client';

import { useState } from 'react';

import { createId } from '@/shared/id';
import {
  createAppointmentRequest,
  type AppointmentRequest,
} from '@/domain/appointments/create-appointment-request';
import type { Service } from '@/shared/types/service';

export function buildAppointmentRequestFormState({
  name,
  phone,
  consent,
  slot,
  selectedServiceId,
}: {
  name: string;
  phone: string;
  consent: boolean;
  slot: string;
  selectedServiceId: string;
}): { canSubmit: boolean; message: string | null } {
  if (!selectedServiceId) {
    return {
      canSubmit: false,
      message: 'Selecciona un servicio para continuar.',
    };
  }

  if (!slot) {
    return {
      canSubmit: false,
      message: 'Selecciona un horario disponible antes de continuar.',
    };
  }

  if (!name.trim() || !phone.trim()) {
    return {
      canSubmit: false,
      message: 'Completa tu nombre y teléfono para continuar.',
    };
  }

  if (!consent) {
    return {
      canSubmit: false,
      message: 'Acepta la confirmación por WhatsApp para continuar.',
    };
  }

  return {
    canSubmit: true,
    message: null,
  };
}

export function buildPendingAppointmentSummary({
  name,
  date,
  slot,
}: {
  name: string;
  date: string;
  slot: string;
}): string {
  return `Solicitud pendiente para ${name} el ${date} a las ${slot}.`;
}

type CustomerBookingSession = {
  name?: string;
  phone?: string;
  notes?: string;
  consent?: boolean;
  selectedServiceId?: string;
  date?: string;
  selectedSlot?: string;
};

export const CUSTOMER_SESSION_STORAGE_KEY = 'bellas-spa-customer-session';

function getCustomerSessionStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage;
  }

  if (typeof globalThis !== 'undefined' && 'sessionStorage' in globalThis) {
    return globalThis.sessionStorage as Storage;
  }

  return null;
}

export function readCustomerSession(): CustomerBookingSession {
  const storage = getCustomerSessionStorage();
  if (!storage) {
    return {};
  }

  try {
    const raw = storage.getItem(CUSTOMER_SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomerBookingSession) : {};
  } catch {
    return {};
  }
}

export function saveCustomerSession(partialSession: CustomerBookingSession): void {
  const storage = getCustomerSessionStorage();
  if (!storage) {
    return;
  }

  const nextSession = { ...readCustomerSession(), ...partialSession };
  storage.setItem(CUSTOMER_SESSION_STORAGE_KEY, JSON.stringify(nextSession));
}

export function clearCustomerSession(): void {
  const storage = getCustomerSessionStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(CUSTOMER_SESSION_STORAGE_KEY);
}

type AppointmentRequestFormProps = {
  service?: Service;
  date: string;
  selectedSlot: string;
  onRequestCreated: (request: AppointmentRequest) => void;
};

export default function AppointmentRequestForm({
  service,
  date,
  selectedSlot,
  onRequestCreated,
}: AppointmentRequestFormProps) {
  const session = readCustomerSession();
  const [name, setName] = useState(session.name ?? '');
  const [phone, setPhone] = useState(session.phone ?? '');
  const [notes, setNotes] = useState(session.notes ?? '');
  const [consent, setConsent] = useState(Boolean(session.consent));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFieldChange = (next: Partial<CustomerBookingSession>) => {
    saveCustomerSession(next);
  };

  const formState = buildAppointmentRequestFormState({
    name,
    phone,
    consent,
    slot: selectedSlot,
    selectedServiceId: service?.id ?? '',
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!service) {
      setErrorMessage('Servicio no disponible para agendar en este momento.');
      return;
    }

    if (!formState.canSubmit) {
      setErrorMessage(formState.message ?? 'Completa los datos requeridos.');
      return;
    }

    try {
      const appointmentRequest = createAppointmentRequest({
        serviceId: service.id,
        client: {
          id: createId(),
          name: name.trim(),
          phone: phone.trim(),
          notes: notes.trim() || undefined,
        },
        date,
        slot: selectedSlot,
        consent,
      });

      const response = await fetch('/api/public/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: name.trim(),
          clientPhone: phone.trim(),
          serviceId: service.id,
          date,
          slot: selectedSlot,
          notes: notes.trim() || undefined,
          whatsappConsent: consent,
        }),
      });
      const result = await response.json() as { id?: string; error?: string };
      if (!response.ok || !result.id) {
        throw new Error(result.error ?? 'No se pudo guardar la solicitud.');
      }

      clearCustomerSession();
      onRequestCreated({ ...appointmentRequest, id: result.id });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear la solicitud.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-[#2f2b2b]">
          Nombre completo
          <input
            aria-label="Nombre completo"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              handleFieldChange({ name: event.target.value });
            }}
            className="mt-2 w-full rounded-xl border border-[#d7c6c2] bg-[#fffaf9] px-3 py-2.5 text-[#1f1b1b] outline-none focus:border-[#d56572]"
          />
        </label>

        <label className="text-sm font-medium text-[#2f2b2b]">
          Teléfono WhatsApp
          <input
            aria-label="Teléfono WhatsApp"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              handleFieldChange({ phone: event.target.value });
            }}
            className="mt-2 w-full rounded-xl border border-[#d7c6c2] bg-[#fffaf9] px-3 py-2.5 text-[#1f1b1b] outline-none focus:border-[#d56572]"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-[#2f2b2b]">
        Notas opcionales
        <textarea
          aria-label="Notas opcionales"
          value={notes}
          onChange={(event) => {
            setNotes(event.target.value);
            handleFieldChange({ notes: event.target.value });
          }}
          className="mt-2 min-h-28 w-full rounded-xl border border-[#d7c6c2] bg-[#fffaf9] px-3 py-2.5 text-[#1f1b1b] outline-none focus:border-[#d56572]"
        />
      </label>

      <label className="flex items-center gap-3 text-sm text-[#403b3b]">
        <input
          aria-label="Acepto que el spa confirme por WhatsApp"
          type="checkbox"
          checked={consent}
          onChange={(event) => {
            setConsent(event.target.checked);
            handleFieldChange({ consent: event.target.checked });
          }}
          className="h-4 w-4 rounded border-[#d7c6c2] text-[#d56572] focus:ring-[#d56572]"
        />
        Acepto que el spa confirme por WhatsApp
      </label>

      {errorMessage ? (
        <p role="alert" className="rounded-2xl border border-[#f2d0d0] bg-[#fff6f6] px-4 py-3 text-sm text-[#7f2d2d]">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        className="rounded-xl bg-[#1f1f21] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#2a2a2d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Enviar solicitud
      </button>
    </form>
  );
}
