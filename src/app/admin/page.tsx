import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AppointmentConfirmAction } from './appointment-confirm-action';
import { getAdminDashboardSummary } from '@/domain/admin-dashboard';
import { listSuppliesForAdmin } from '@/domain/inventory/inventory-service';
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
  const pageTitle = status ? `Citas ${statusLabels[status].toLowerCase()}s` : statusLabels[status];
  const supplies = await listSuppliesForAdmin();
  const lowStockSupplies = supplies
    .filter((supply) => supply.isActive && supply.isLowStock)
    .slice(0, 3);
  const summary = {
    ...getAdminDashboardSummary(),
    lowStockItems: supplies.filter((supply) => supply.isActive && supply.isLowStock).length,
  };

  return (
    <main className="flex-1 overflow-auto px-8 py-7">
      {/* Breadcrumb */}
      <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">
        Bellas · Panel del spa
      </div>

      {/* Tarjeta principal */}
      <div className="rounded-[28px] bg-[#f7f2ef] p-5">

        {/* Título + botón */}
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-[48px] leading-[0.96] tracking-[-0.04em] text-[#d56572]">
              {pageTitle}
            </h1>
            <p className="mt-2 text-[16px] leading-6 text-[#504a49]">
              Confirma, reprograma o cancela las solicitudes que llegaron.
            </p>
          </div>
          <button className="shrink-0 rounded-xl bg-[#f5e6e7] border border-[#e8c4c6] px-4 py-2.5 text-[15px] font-semibold text-[#2a2121]">
            + Nueva cita
          </button>
        </div>

        {/* Barra de filtros */}
        <form action="/admin" method="get" className="mb-6 grid gap-3 rounded-2xl bg-[#efe8e3] p-4 md:grid-cols-[1.2fr_1.2fr_1fr_0.8fr]">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#4d433f]">Fecha</span>
            <input
              type="date"
              name="date"
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

          <div className="flex flex-col justify-end">
            <Link
              href="/admin"
              className="flex h-12 items-center justify-center rounded-xl border border-[#d8c7c2] bg-[#f7f3f1] text-[#4f4744] font-medium"
            >
              Limpiar filtros
            </Link>
          </div>
        </form>

        {/* Métricas KPI */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Pendientes</p>
            <p className="mt-3 text-2xl font-bold text-[#2a2323]">{summary.pendingAppointments}</p>
          </div>
          <div className="rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Confirmadas</p>
            <p className="mt-3 text-2xl font-bold text-[#2a2323]">{summary.confirmedAppointments}</p>
          </div>
          <div className="rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Vencidas</p>
            <p className="mt-3 text-2xl font-bold text-[#2a2323]">{summary.expiredAppointments}</p>
          </div>
          <div className="rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Servicios</p>
            <p className="mt-3 text-2xl font-bold text-[#2a2323]">{summary.activeServices}</p>
          </div>
          <div className="rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Stock bajo</p>
            <p className="mt-3 text-2xl font-bold text-[#2a2323]">{summary.lowStockItems}</p>
          </div>
        </div>

        {/* Alerta de inventario bajo */}
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

        {/* Grid de tarjetas de citas */}
        <div className="grid gap-5 xl:grid-cols-2">
          {appointments.map((appointment) => {
            const scheduledStart = appointment.scheduledStart;
            const time = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }).format(scheduledStart);
            const period = scheduledStart.getHours() >= 12 ? 'PM' : 'AM';
            const date = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(scheduledStart);
            const isPending = appointment.status === 'pendiente';

            const badgeClass = (() => {
              switch (appointment.status) {
                case 'pendiente': return 'bg-[#f5e3d7] text-[#7c4a31]';
                case 'confirmada': return 'bg-[#dff5ea] text-[#1d6a4d]';
                case 'cancelada': return 'bg-[#fde8e8] text-[#7c1d1d]';
                default: return 'bg-[#e8e8e8] text-[#4a4a4a]';
              }
            })();

            return (
              <article key={appointment.id} className="rounded-[22px] border border-[#e6d7d2] bg-[#f7f3f1] p-5">
                <div className="flex items-start gap-6">
                  {/* Columna izquierda: hora */}
                  <div className="w-28 shrink-0 pt-1 text-center">
                    <div className="font-serif text-[44px] leading-none text-[#2f2b2a]">{time}</div>
                    <div className="mt-1.5 text-[11px] uppercase tracking-[0.12em] text-[#7d6966]">{period}</div>
                    <div className="mt-3 text-[12px] leading-5 text-[#7d6966]">{date}</div>
                  </div>

                  {/* Separador vertical */}
                  <div className="self-stretch w-px bg-[#e6d7d2] shrink-0" />

                  {/* Columna derecha: datos */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[18px] font-medium text-[#47413f]">{appointment.client?.name ?? 'Cliente'}</div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${badgeClass}`}>
                        {statusLabels[appointment.status]}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 text-[14px] leading-6 text-[#4c4544]">
                      <div className="flex items-center gap-2"><span className="text-[#a08880]">📅</span> {date}</div>
                      <div className="flex items-center gap-2"><span className="text-[#a08880]">⏰</span> {time} {period}</div>
                      <div className="flex items-center gap-2"><span className="text-[#a08880]">✦</span> {appointment.service?.name ?? 'Servicio no disponible'}</div>
                      <div className="flex items-center gap-2"><span className="text-[#a08880]">📞</span> {appointment.client?.phone ?? 'Sin teléfono'}</div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-5 flex flex-wrap gap-3">
                  {isPending ? (
                    <AppointmentConfirmAction appointmentId={appointment.id} />
                  ) : (
                    <button disabled className="rounded-xl bg-[#e0e0e0] px-4 py-2.5 text-[13px] font-semibold text-[#888] cursor-not-allowed">
                      Cita confirmada
                    </button>
                  )}
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

      {/* Footer */}
    </main>
  );
}
