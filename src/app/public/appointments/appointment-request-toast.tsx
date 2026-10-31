'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

import type { AppointmentRequest } from '@/domain/appointments/create-appointment-request';

/**
 * Aviso flotante que confirma al cliente que su solicitud fue enviada.
 * No usa role="status": ese rol pertenece al mensaje inline de confirmacion
 * (lo verifican los tests e2e con texto exacto).
 */
export default function AppointmentRequestToast({ request }: { request: AppointmentRequest | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!request) return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(timer);
  }, [request]);

  if (!request || !visible) return null;

  return (
    <div
      aria-live="polite"
      className="fixed right-4 top-4 z-50 w-[min(92vw,360px)] animate-in fade-in-0 slide-in-from-top-4 duration-300"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-2xl">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success-soft text-success">
          <CheckCircle2 size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">¡Solicitud enviada!</p>
          <p className="mt-0.5 text-xs leading-5 text-body">
            Recibimos tu pedido de cita. Te escribiremos por WhatsApp para confirmar.
          </p>
        </div>
        <button
          type="button"
          aria-label="Cerrar aviso"
          onClick={() => setVisible(false)}
          className="rounded-lg p-1 text-muted-foreground transition hover:bg-surface-hover hover:text-foreground"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
