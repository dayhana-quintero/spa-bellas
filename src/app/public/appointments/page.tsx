import Link from 'next/link';

import AppointmentRequestFlow from './appointment-request-flow';

export default function PublicAppointmentsPage() {
  return (
    <main className="min-h-screen flex-1 bg-background text-foreground">
      <div className="mx-auto max-w-[1120px] px-5 py-10 sm:px-6">
        <Link
          href="/public"
          className="logo-silver inline-block text-2xl font-semibold tracking-[0.2em]"
        >
          BELLAS
        </Link>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Bellas Spa
        </p>
        <h1 className="mt-3 font-display text-[clamp(40px,6vw,56px)] font-semibold leading-none text-cherry">
          Solicitar cita
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-body">
          Elige tu servicio, día y horario. No pagas ahora: te escribiremos para confirmar.
        </p>

        <AppointmentRequestFlow />
      </div>
    </main>
  );
}
