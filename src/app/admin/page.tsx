import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AppointmentConfirmAction } from './appointment-confirm-action';
import { LogoutButton } from './logout-button';
import { getAdminDashboardSummary, getLowStockSupplies } from '@/domain/admin-dashboard';
import { listAppointmentsForAdmin } from '@/domain/spa-service';
import { readAdminSessionFromCookie } from '@/shared/auth';

const appointmentStatuses = ['', 'pendiente', 'confirmada', 'cancelada', 'vencida', 'completada', 'no asistio', 'reprogramacion solicitada', 'reprogramada'] as const;
const statusLabels: Record<(typeof appointmentStatuses)[number], string> = {
  '': 'Todas las citas',
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  vencida: 'Vencida',
  completada: 'Completada',
  'no asistio': 'No asistió',
  'reprogramacion solicitada': 'Reprogramación solicitada',
  reprogramada: 'Reprogramada',
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin-session');
  const session = readAdminSessionFromCookie(sessionCookie?.value);

  if (!session) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const requestedStatus = Array.isArray(params.status) ? 'pendiente' : params.status ?? 'pendiente';
  const status = appointmentStatuses.includes(requestedStatus as (typeof appointmentStatuses)[number])
    ? requestedStatus as (typeof appointmentStatuses)[number]
    : 'pendiente';
  const appointments = (await listAppointmentsForAdmin({ status: status || undefined })) as Array<{
    id: string;
    status: (typeof appointmentStatuses)[number];
    scheduledStart: Date;
    client?: { name?: string; phone?: string };
    service?: { name?: string };
  }>;
  const pendingCount = (await listAppointmentsForAdmin({ status: 'pendiente' })).length;
  const pageTitle = status ? `Citas ${statusLabels[status].toLowerCase()}s` : statusLabels[status];
  const summary = getAdminDashboardSummary();
  const lowStockSupplies = getLowStockSupplies().slice(0, 3);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f0ef] text-[#2a2423]">
      <aside className="flex w-65 shrink-0 flex-col bg-[#17171a] px-4 py-5 text-[#f9f2f1]">
        <div className="mb-7 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#d7d0ce]">
          Bellas • Panel del spa
        </div>

        <div className="mb-6 px-2">
          <div className="font-serif text-[44px] font-bold leading-[0.72] tracking-[0.02em] text-[#f5f0ef]">
            BELLA
            <span className="inline-block w-[0.18em]" aria-hidden="true" />
            <span className="inline-block translate-y-[-0.04em]">S</span>
          </div>
          <div className="mt-1 text-[14px] text-[#d7d2d0]">Panel del spa</div>
        </div>

        <nav className="space-y-2">
          <Link href="/admin" className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium text-[#f5f0ef] ${status === 'pendiente' ? 'bg-[#2b2b2f] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]' : 'opacity-80 hover:bg-[#2b2b2f]'}`}>
            <span className="text-lg">📅</span>
            <span>Citas pendientes</span>
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f5d9d5] px-1 text-[11px] font-bold text-[#1d1a1a]">
              {pendingCount}
            </span>
          </Link>

          <Link href="/admin?status=confirmada" className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] text-[#ece4e1] ${status === 'confirmada' ? 'bg-[#2b2b2f] opacity-100' : 'opacity-80 hover:bg-[#2b2b2f]'}`}>
            <span className="text-lg">✓</span>
            <span>Citas confirmadas</span>
          </Link>

          <Link href="/admin?status=cancelada" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] text-[#ece4e1] opacity-80 hover:bg-[#2b2b2f]">
            <span className="text-lg">✕</span>
            <span>Citas canceladas</span>
          </Link>

          <Link href="/admin/inventory" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] text-[#ece4e1] opacity-80 hover:bg-[#2b2b2f]">
            <span className="text-lg">🧴</span>
            <span>Insumos</span>
          </Link>

          <Link href="/admin/appointments/history" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] text-[#ece4e1] opacity-80 hover:bg-[#2b2b2f]">
            <span className="text-lg">🧾</span>
            <span>Historial de citas</span>
          </Link>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-3 text-[15px] font-medium text-[#f5f0ef] transition hover:bg-white/5"
          >
            <span>◐</span>
            <span>Ver como cliente</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden px-8 py-7">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">
            Bellas · Panel del spa
          </div>

          <div className="flex items-center gap-2.5">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9c9c4] bg-[#f7f3f2] text-[#4f4744] text-sm">
              ◐
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9c9c4] bg-[#f7f3f2] text-[#4f4744] text-sm">
              ⏷
            </button>
            <button className="rounded-xl border border-[#2c2a2a] bg-[#1d1d1f] px-4 py-2 text-sm font-medium text-white">
              Exportar
            </button>
          </div>
        </div>

        <div className="h-[calc(100vh-120px)] overflow-y-auto rounded-[28px] bg-[#f7f2ef] p-5 shadow-[0_0_0_1px_rgba(104,76,72,0.03)]">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-[40px] leading-[0.96] tracking-[-0.04em] text-[#d56572] sm:text-[44px] lg:text-[48px]">
                {pageTitle}
              </h1>
              <p className="mt-2 text-[16px] leading-6 text-[#504a49]">
                Confirma, reprograma o cancela las solicitudes que llegaron.
              </p>
            </div>

            <button className="shrink-0 rounded-xl bg-[#e9c1c0] px-4 py-2.5 text-[15px] font-semibold text-[#2a2121] shadow-sm transition hover:bg-[#e4b3b4]">
              + Nueva cita
            </button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Pendientes</p>
              <p className="mt-3 text-3xl font-bold text-[#2a2323]">{summary.pendingAppointments}</p>
            </div>
            <div className="rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Confirmadas</p>
              <p className="mt-3 text-3xl font-bold text-[#2a2323]">{summary.confirmedAppointments}</p>
            </div>
            <div className="rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Vencidas</p>
              <p className="mt-3 text-3xl font-bold text-[#2a2323]">{summary.expiredAppointments}</p>
            </div>
            <div className="rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Servicios</p>
              <p className="mt-3 text-3xl font-bold text-[#2a2323]">{summary.activeServices}</p>
            </div>
            <div className="rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Stock bajo</p>
              <p className="mt-3 text-3xl font-bold text-[#2a2323]">{summary.lowStockItems}</p>
            </div>
          </div>

          {lowStockSupplies.length > 0 ? (
            <div className="mb-6 rounded-2xl border border-[#f2d8d0] bg-[#fff7f5] p-4 text-[#5b403d]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7d6966]">Prioridad de inventario</p>
              <ul className="mt-3 space-y-2 text-sm">
                {lowStockSupplies.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2">
                    <span>{item.name}</span>
                    <span>{item.quantityAvailable}/{item.minimumThreshold}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <form action="/admin" method="get" className="mb-6 grid gap-3 rounded-2xl bg-[#efe8e3] p-4 md:grid-cols-[1.2fr_1.2fr_1fr_0.8fr]">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-[#4d433f]">Fecha</span>
              <input
                type="text"
                value="dd/mm/aaaa"
                readOnly
                className="h-12 rounded-xl border border-[#d8c7c2] bg-[#f7f3f1] px-3 text-[#5d5b5b] outline-none"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-[#4d433f]">Servicio</span>
              <select className="h-12 rounded-xl border border-[#d8c7c2] bg-[#f7f3f1] px-3 text-[#5d5b5b] outline-none">
                <option>Todos los servicios</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-[#4d433f]">Estado</span>
              <select name="status" defaultValue={status} className="h-12 rounded-xl border border-[#d8c7c2] bg-[#f7f3f1] px-3 text-[#5d5b5b] outline-none">
                {appointmentStatuses.map((value) => (
                  <option key={value} value={value}>{statusLabels[value]}</option>
                ))}
              </select>
            </label>

            <button type="submit" className="mt-auto h-12 rounded-xl border border-[#d8c7c2] bg-[#f7f3f1] text-[#4f4744] font-medium">
              Filtrar
            </button>
          </form>

          <div className="grid gap-5 xl:grid-cols-2">
            {appointments.map((appointment) => {
              const scheduledStart = appointment.scheduledStart;
              const time = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }).format(scheduledStart);
              const period = scheduledStart.getHours() >= 12 ? 'PM' : 'AM';
              const date = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(scheduledStart);
              const isPending = appointment.status === 'pendiente';

              return (
              <article key={appointment.id} className="rounded-[22px] border border-[#e6d7d2] bg-[#f7f3f1] p-5 shadow-[0_0_0_1px_rgba(72,53,49,0.02)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-24 pt-1 text-center">
                      <div className="font-serif text-[40px] leading-none text-[#2f2b2a]">{time}</div>
                      <div className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[#7d6966]">{period}</div>
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[18px] font-medium text-[#47413f]">{appointment.client?.name ?? 'Cliente'}</div>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${isPending ? 'bg-[#f5e3d7] text-[#7c4a31]' : 'bg-[#dff5ea] text-[#1d6a4d]'}`}>
                          {statusLabels[appointment.status]}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-[14px] leading-6 text-[#4c4544]">
                        <div>Fecha: {date}</div>
                        <div>Hora: {time} {period}</div>
                        <div>Servicio: {appointment.service?.name ?? 'Servicio no disponible'}</div>
                        <div>Teléfono: {appointment.client?.phone ?? 'Sin teléfono'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {isPending ? <AppointmentConfirmAction appointmentId={appointment.id} /> : null}
                  <button className="rounded-xl border border-[#d8c7c2] bg-[#f7f3f1] px-4 py-2.5 text-[13px] font-semibold text-[#2b1e1c] hover:bg-[#efe7e4]">
                    Reprogramar
                  </button>
                  <button className="rounded-xl border border-[#d8c7c2] bg-[#f7f3f1] px-4 py-2.5 text-[13px] font-semibold text-[#2b1e1c] hover:bg-[#efe7e4]">
                    Cancelar
                  </button>
                </div>
              </article>
              );
            })}
            {appointments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#d8c7c2] px-5 py-8 text-center text-sm text-[#625856] xl:col-span-2">
                No hay solicitudes pendientes por ahora.
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <LogoutButton />
        </div>
      </main>
    </div>
  );
}
