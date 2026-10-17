import AppointmentRequestFlow from './appointment-request-flow';

export default function PublicAppointmentsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Bellas Spa</p>
        <h1 className="mt-4 font-serif text-5xl text-brand">Solicitar cita</h1>
        <AppointmentRequestFlow />
      </div>
    </main>
  );
}
