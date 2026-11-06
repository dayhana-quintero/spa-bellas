import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAppointmentHistory } from '@/domain/appointments/appointment-history-service';
import { getAppointmentStatusMeta } from '@/domain/appointments/appointment-status-meta';
import { readSpaData } from '@/storage/spa-store';
import type { Appointment } from '@/shared/types/appointment';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatHour(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function buildPageUrl(
  p: number,
  status: string,
  from: string,
  to: string,
): string {
  const sp = new URLSearchParams();
  if (status) sp.set('status', status);
  if (from) sp.set('from', from);
  if (to) sp.set('to', to);
  sp.set('page', String(p));
  return `/admin/appointments/history?${sp.toString()}`;
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string; page?: string }>;
}) {
  const params = await searchParams;

  const status = params.status ?? '';
  const dateFrom = params.from ?? '';
  const dateTo = params.to ?? '';
  const page = Number(params.page ?? '1') || 1;

  const result = await getAppointmentHistory({
    status: (status || undefined) as Appointment['status'] | undefined,
    from: dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined,
    to: dateTo ? new Date(`${dateTo}T23:59:59`) : undefined,
    page,
    pageSize: 10,
  });

  const spaData = readSpaData();

  const rows = result.items.map((item) => ({
    ...item,
    clientName:
      item.client?.name ??
      spaData.clients.find((c) => c.id === item.clientId)?.name ??
      'Cliente sin nombre',
    serviceName:
      item.service?.name ??
      spaData.services.find((s) => s.id === item.serviceId)?.name ??
      'Servicio sin nombre',
  }));

  const total = result.total;

  return (
      <main className="min-h-0 flex-1 overflow-auto px-4 pb-24 pt-14 md:px-7 md:py-6 md:pb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Bellas · Panel del spa
          </div>
        </div>

        <div className="rounded-[22px] bg-background p-6">
          <h1 className="font-serif text-[40px] leading-[0.96] tracking-[-0.04em] text-foreground sm:text-[44px] lg:text-[48px]">Historial de citas</h1>
          <p className="mt-4 mb-6 text-lg text-body">Todas las citas realizadas, con su estado.</p>

          <div className="mb-5 flex items-center gap-3 rounded-xl bg-surface-soft px-5 py-4">
            <span className="text-[38px] font-bold text-foreground">{total}</span>
            <span className="text-lg text-foreground">Total de citas: {total}</span>
          </div>

          <form
            action="/admin/appointments/history"
            method="get"
            className="mb-5 grid gap-3 rounded-xl bg-surface-soft p-4 md:grid-cols-[1.2fr_1.2fr_1fr_auto]"
          >
            <label className="flex flex-col gap-2 text-sm text-body">
              <span>Fecha desde</span>
              <input
                type="date"
                name="from"
                defaultValue={dateFrom}
                className="h-11 rounded-xl border border-line bg-background px-3 text-[#333] outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-body">
              <span>Fecha hasta</span>
              <input
                type="date"
                name="to"
                defaultValue={dateTo}
                className="h-11 rounded-xl border border-line bg-background px-3 text-[#333] outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-body">
              <span>Estado</span>
              <select
                name="status"
                defaultValue={status}
                className="h-11 rounded-xl border border-line bg-background px-3 text-sm text-[#333] outline-none"
              >
                <option value="">Todos</option>
                <option value="completada">Completada</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="pendiente">Pendiente</option>
                <option value="vencida">Vencida</option>
                <option value="reprogramada">Reprogramada</option>
                <option value="reprogramacion solicitada">Reprogramación solicitada</option>
                <option value="no asistio">No asistió</option>
              </select>
            </label>

            <div className="flex flex-col gap-2 mt-auto">
              <button
                type="submit"
                className="h-11 rounded-xl border border-line bg-background px-4 text-foreground"
              >
                Filtrar
              </button>
            </div>
          </form>

          {(status || dateFrom || dateTo) && (
            <div className="mb-4">
              <Link
                href="/admin/appointments/history"
                className="text-sm text-body underline"
              >
                Limpiar filtros
              </Link>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-line bg-background">
            <Table className="w-full border-separate border-spacing-0">
              <TableHeader className="bg-surface-soft">
                <TableRow>
                  <TableHead className="px-4 py-3.5 text-left text-sm font-bold text-body">Cliente</TableHead>
                  <TableHead className="px-4 py-3.5 text-left text-sm font-bold text-body">Servicio</TableHead>
                  <TableHead className="px-4 py-3.5 text-left text-sm font-bold text-body">Fecha</TableHead>
                  <TableHead className="px-4 py-3.5 text-left text-sm font-bold text-body">Hora</TableHead>
                  <TableHead className="px-4 py-3.5 text-left text-sm font-bold text-body">Estado</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-4 py-6 text-center text-body">
                      No hay citas para los filtros actuales.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => {
                    const meta = getAppointmentStatusMeta(row.status);

                    return (
                      <TableRow key={row.id} className={index % 2 === 0 ? 'bg-surface-warm' : 'bg-surface-warm'}>
                        <TableCell className="px-4 py-4 text-[15px] text-foreground">
                          <Link
                            href={`/admin/appointments/history/${row.id}`}
                            className="underline decoration-dotted underline-offset-4 hover:text-brand"
                          >
                            {row.clientName}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-[15px] text-foreground">{row.serviceName}</TableCell>
                        <TableCell className="px-4 py-4 text-[15px] text-foreground">{formatDate(row.scheduledStart)}</TableCell>
                        <TableCell className="px-4 py-4 text-[15px] text-foreground">{formatHour(row.scheduledStart)}</TableCell>
                        <TableCell className="px-4 py-4">
                          <span
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold"
                            style={{ color: meta.color, backgroundColor: meta.bg }}
                          >
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: meta.color }}
                            />
                            {meta.label}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {result.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              {page > 1 ? (
                <Link
                  href={buildPageUrl(page - 1, status, dateFrom, dateTo)}
                  className="rounded-lg border border-line bg-background px-4 py-2 text-sm text-foreground"
                >
                  Anterior
                </Link>
              ) : (
                <span className="rounded-lg border border-line bg-background px-4 py-2 text-sm text-foreground opacity-50">
                  Anterior
                </span>
              )}
              <span className="text-sm text-body">
                Página {result.page} de {result.totalPages}
              </span>
              {page < result.totalPages ? (
                <Link
                  href={buildPageUrl(page + 1, status, dateFrom, dateTo)}
                  className="rounded-lg border border-line bg-background px-4 py-2 text-sm text-foreground"
                >
                  Siguiente
                </Link>
              ) : (
                <span className="rounded-lg border border-line bg-background px-4 py-2 text-sm text-foreground opacity-50">
                  Siguiente
                </span>
              )}
            </div>
          )}
        </div>
      </main>
  );
}
