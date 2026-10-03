"use client";

import { useMemo } from 'react';

import { listAppointments } from '@/domain/spa-service';
import { PendingAppointmentsPage } from '../pending-page';

export default function AdminPendingAppointmentsRoute() {
  const appointments = useMemo(() => listAppointments({ status: 'pendiente' }), []);

  return (
    <main className="min-h-screen bg-[#f5f0ee] px-6 py-10 text-[#1f1b1b]">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d6966]">Admin</p>
        <h1 className="mt-4 font-serif text-5xl text-[#d56572]">Citas pendientes</h1>
        <div className="mt-8">
          <PendingAppointmentsPage appointments={appointments} />
        </div>
      </div>
    </main>
  );
}
