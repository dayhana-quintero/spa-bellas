import { Suspense } from 'react';

import { listAppointmentsForAdmin } from '@/domain/spa-service';
import { PendingAppointmentsPage } from '../pending-page';

async function PendingAppointmentsData() {
  const appointments = await listAppointmentsForAdmin({ status: 'pendiente' });
  return <PendingAppointmentsPage appointments={appointments} />;
}

export default function AdminPendingAppointmentsRoute() {
  return (
    <main className="flex-1 overflow-auto px-8 py-7">
      <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">
        Bellas · Panel del spa
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-[40px] leading-[0.96] tracking-[-0.04em] text-[#2a2121]">
          Citas pendientes
        </h1>
        <p className="mt-2 text-[16px] leading-6 text-[#504a49]">
          Confirma, reprograma o cancela las solicitudes que llegaron.
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-[#625856]">Cargando citas...</p>}>
        <PendingAppointmentsData />
      </Suspense>
    </main>
  );
}
