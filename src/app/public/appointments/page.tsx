import AppointmentRequestFlow from './appointment-request-flow';

export default function PublicAppointmentsPage() {
  return (
    <main className="min-h-screen bg-[#f5f0ee] px-6 py-10 text-[#1f1b1b]">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d6966]">Bellas Spa</p>
        <h1 className="mt-4 font-serif text-5xl text-[#d56572]">Solicitar cita</h1>
        <AppointmentRequestFlow />
      </div>
    </main>
  );
}
