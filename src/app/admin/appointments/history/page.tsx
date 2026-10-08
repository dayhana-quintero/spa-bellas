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
      <main className="flex-1 overflow-auto px-7 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[11px] font-semibold tracking-[0.08em] text-[#7d6966] uppercase">
            Bellas · Panel del spa
          </div>
        </div>

        <div className="rounded-[22px] bg-[#f7f2ef] p-6">
          <h1 className="font-serif text-[52px] font-bold leading-[1.1] text-[#d56572]">Historial de citas</h1>
          <p className="mt-4 mb-6 text-lg text-[#4a4a4a]">Todas las citas realizadas, con su estado.</p>

          <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#efe6e0] px-5 py-4">
            <span className="text-[38px] font-bold text-[#2b2b2b]">{total}</span>
            <span className="text-lg text-[#373737]">Total de citas: {total}</span>
          </div>

          <form
            action="/admin/appointments/history"
            method="get"
            className="mb-5 grid gap-3 rounded-xl bg-[#efe8e3] p-4 md:grid-cols-[1.2fr_1.2fr_1fr_auto]"
          >
            <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
              <span>Fecha desde</span>
              <input
                type="date"
                name="from"
                defaultValue={dateFrom}
                className="h-11 rounded-xl border border-[#d9c8c3] bg-[#f5f2f0] px-3 text-[#333] outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
              <span>Fecha hasta</span>
              <input
                type="date"
                name="to"
                defaultValue={dateTo}
                className="h-11 rounded-xl border border-[#d9c8c3] bg-[#f5f2f0] px-3 text-[#333] outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
              <span>Estado</span>
              <select
                name="status"
                defaultValue={status}
                className="h-11 rounded-xl border border-[#d9c8c3] bg-[#f5f2f0] px-3 text-sm text-[#333] outline-none"
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
                className="h-11 rounded-xl border border-[#d9c8c3] bg-[#f5f2f0] px-4 text-[#3c3332]"
              >
                Filtrar
              </button>
            </div>
          </form>

          {(status || dateFrom || dateTo) && (
            <div className="mb-4">
              <Link
                href="/admin/appointments/history"
                className="text-sm text-[#5a4541] underline"
              >
                Limpiar filtros
              </Link>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-[#d9c8c3] bg-[#f5f1ee]">
            <Table className="w-full border-separate border-spacing-0">
              <TableHeader className="bg-[#efe8e3]">
                <TableRow>
                  <TableHead className="px-4 py-3.5 text-left text-sm font-bold text-[#4a423f]">Cliente</TableHead>
                  <TableHead className="px-4 py-3.5 text-left text-sm font-bold text-[#4a423f]">Servicio</TableHead>
                  <TableHead className="px-4 py-3.5 text-left text-sm font-bold text-[#4a423f]">Fecha</TableHead>
                  <TableHead className="px-4 py-3.5 text-left text-sm font-bold text-[#4a423f]">Hora</TableHead>
                  <TableHead className="px-4 py-3.5 text-left text-sm font-bold text-[#4a423f]">Estado</TableHead>
                  <TableHead className="px-4 py-3.5 text-left text-sm font-bold text-[#4a423f]">Profesional</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-4 py-6 text-center text-[#4a423f]">
                      No hay citas para los filtros actuales.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => {
                    const meta = getAppointmentStatusMeta(row.status);

                    return (
                      <TableRow key={row.id} className={index % 2 === 0 ? 'bg-[#f6f2ef]' : 'bg-[#f9f6f4]'}>
                        <TableCell className="px-4 py-4 text-[15px] text-[#2b2b2b]">
                          <Link
                            href={`/admin/appointments/history/${row.id}`}
                            className="underline decoration-dotted underline-offset-4 hover:text-[#d56572]"
                          >
                            {row.clientName}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-[15px] text-[#2b2b2b]">{row.serviceName}</TableCell>
                        <TableCell className="px-4 py-4 text-[15px] text-[#2b2b2b]">{formatDate(row.scheduledStart)}</TableCell>
                        <TableCell className="px-4 py-4 text-[15px] text-[#2b2b2b]">{formatHour(row.scheduledStart)}</TableCell>
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
                        <TableCell className="px-4 py-4 text-[15px] text-[#2b2b2b]">—</TableCell>
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
                  className="rounded-lg border border-[#d9c8c3] bg-[#f5f2f0] px-4 py-2 text-sm text-[#3c3332]"
                >
                  Anterior
                </Link>
              ) : (
                <span className="rounded-lg border border-[#d9c8c3] bg-[#f5f2f0] px-4 py-2 text-sm text-[#3c3332] opacity-50">
                  Anterior
                </span>
              )}
              <span className="text-sm text-[#4a423f]">
                Página {result.page} de {result.totalPages}
              </span>
              {page < result.totalPages ? (
                <Link
                  href={buildPageUrl(page + 1, status, dateFrom, dateTo)}
                  className="rounded-lg border border-[#d9c8c3] bg-[#f5f2f0] px-4 py-2 text-sm text-[#3c3332]"
                >
                  Siguiente
                </Link>
              ) : (
                <span className="rounded-lg border border-[#d9c8c3] bg-[#f5f2f0] px-4 py-2 text-sm text-[#3c3332] opacity-50">
                  Siguiente
                </span>
              )}
            </div>
          )}
        </div>
      </main>
  );
}
