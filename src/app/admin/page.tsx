import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { filterAppointmentsForLocalDay, getAdminDashboardSummary, getLocalDayBounds } from '@/domain/admin-dashboard';
import { getAppointmentStatusMeta } from '@/domain/appointments/appointment-status-meta';
import { listAppointmentsForAdmin } from '@/domain/spa-service';
import { evaluateRouteAccess } from '@/shared/auth/access';
import { readAdminSessionFromCookie } from '@/shared/auth';
import { AppointmentConfirmAction } from './appointment-confirm-action';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore?.get('admin-session');
  const accessResult = evaluateRouteAccess(sessionCookie?.value);

  if (!accessResult.isAllowed) {
    redirect(accessResult.redirectTo ?? '/admin/login');
  }

  const session = readAdminSessionFromCookie(sessionCookie?.value);
  if (!session) {
    redirect('/admin/login');
  }

  const { start: todayStart } = getLocalDayBounds();
  const [summary, upcomingAppointments] = await Promise.all([
    getAdminDashboardSummary(),
    listAppointmentsForAdmin({ from: todayStart.toISOString() }),
  ]);
  const lowStockSupplies = summary.lowStockSupplies.slice(0, 3);
  // Todas las citas del dia local (cualquier estado), de la mas temprana a la mas tardia.
  const todayAppointments = filterAppointmentsForLocalDay(upcomingAppointments);

  return (
    <main className="flex-1 overflow-auto px-8 py-7">
      <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Bellas · Panel del spa
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-[40px] leading-[0.96] tracking-[-0.04em] text-foreground">
          Resumen operativo
        </h1>
        <p className="mt-2 text-[16px] leading-6 text-body">
          Estado del día — {summary.generatedAt.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Link
          href="/admin/appointments/pending"
          className="group rounded-2xl border border-line bg-surface p-4 shadow-sm transition hover:shadow-md"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Pendientes</p>
          <p className="mt-3 font-serif text-[44px] leading-none text-foreground group-hover:text-brand transition-colors">
            {summary.pendingAppointments}
          </p>
        </Link>

        <Link
          href="/admin/appointments/history?status=confirmada"
          className="group rounded-2xl border border-line bg-surface p-4 shadow-sm transition hover:shadow-md"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Confirmadas</p>
          <p className="mt-3 font-serif text-[44px] leading-none text-foreground group-hover:text-success-text transition-colors">
            {summary.confirmedAppointments}
          </p>
        </Link>

        <Link
          href="/admin/appointments/history?status=vencida"
          className="group rounded-2xl border border-line bg-surface p-4 shadow-sm transition hover:shadow-md"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Vencidas</p>
          <p className="mt-3 font-serif text-[44px] leading-none text-foreground group-hover:text-amber-text transition-colors">
            {summary.expiredAppointments}
          </p>
        </Link>

        <Link
          href="/admin/services"
          className="group rounded-2xl border border-line bg-surface p-4 shadow-sm transition hover:shadow-md"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Servicios</p>
          <p className="mt-3 font-serif text-[44px] leading-none text-foreground group-hover:text-success-text transition-colors">
            {summary.activeServices}
          </p>
        </Link>

        <Link
          href="/admin/inventory"
          className="group rounded-2xl border border-line bg-surface p-4 shadow-sm transition hover:shadow-md"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Stock bajo</p>
          <p className="mt-3 font-serif text-[44px] leading-none text-foreground group-hover:text-amber transition-colors">
            {summary.lowStockItems}
          </p>
        </Link>
      </div>

      {lowStockSupplies.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-line bg-brand-soft p-4 text-body">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Prioridad de inventario</p>
          <ul className="mt-3 space-y-2 text-sm">
            {lowStockSupplies.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface/70 px-3 py-2">
                <span>{item.name}</span>
                <span className="text-danger">
                  {item.quantityAvailable}/{item.minimumThreshold}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <nav className="rounded-[22px] border border-line bg-surface-warm p-5">
          <h2 className="font-serif text-[28px] text-foreground">Acceso rápido</h2>
          <div className="mt-4 grid gap-3">
            <Link
              href="/admin/appointments/pending"
              className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-[15px] font-medium text-foreground transition hover:bg-surface-hover"
            >
              <span>📅</span>
              <span>Citas pendientes</span>
              <span className="rounded-full bg-sidebar-badge px-2 text-[11px] font-bold text-on-pastel">
                {summary.pendingAppointments}
              </span>
            </Link>
            <Link
              href="/admin/appointments/history"
              className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-[15px] font-medium text-foreground transition hover:bg-surface-hover"
            >
              <span>🧾</span>
              <span>Historial de citas</span>
            </Link>
            <Link
              href="/admin/inventory"
              className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-[15px] font-medium text-foreground transition hover:bg-surface-hover"
            >
              <span>🧴</span>
              <span>Inventario</span>
            </Link>
            <Link
              href="/admin/services"
              className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-[15px] font-medium text-foreground transition hover:bg-surface-hover"
            >
              <span>💆</span>
              <span>Servicios</span>
            </Link>
          </div>
        </nav>

        <div className="rounded-[22px] border border-line bg-surface-warm p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-[28px] text-foreground">Citas de hoy</h2>
            <p className="text-sm text-muted-foreground">
              {todayAppointments.length === 0
                ? 'Sin reservas'
                : `${todayAppointments.length} ${todayAppointments.length === 1 ? 'cita' : 'citas'}`}
            </p>
          </div>
          {todayAppointments.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No hay citas programadas para hoy.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {todayAppointments.map((appointment) => {
                const time = new Intl.DateTimeFormat('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }).format(appointment.scheduledStart);
                const meta = getAppointmentStatusMeta(appointment.status);

                return (
                  <li
                    key={appointment.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3"
                  >
                    <div>
                      <p className="text-[15px] font-medium text-foreground">{appointment.client?.name ?? 'Cliente'}</p>
                      <p className="text-sm text-muted-foreground">{time} · {appointment.service?.name ?? 'Servicio'}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ color: meta.color, backgroundColor: meta.bg }}
                      >
                        {meta.label}
                      </span>
                      {appointment.status === 'pendiente' ? (
                        <AppointmentConfirmAction appointmentId={appointment.id} />
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
