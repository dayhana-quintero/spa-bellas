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
      <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Bellas · Panel del spa
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-[40px] leading-[0.96] tracking-[-0.04em] text-foreground">
          Citas pendientes
        </h1>
        <p className="mt-2 text-[16px] leading-6 text-body">
          Confirma, reprograma o cancela las solicitudes que llegaron.
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando citas...</p>}>
        <PendingAppointmentsData />
      </Suspense>
    </main>
  );
}
