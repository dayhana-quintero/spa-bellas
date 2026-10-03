"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAppointmentHistory } from '@/domain/appointments/appointment-history-service';
import type { Appointment } from '@/shared/types/appointment';

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: '#7a2a2a', bg: '#f8e1e3' },
  confirmada: { label: 'Confirmada', color: '#1d6a4d', bg: '#dff5ea' },
  cancelada: { label: 'Cancelada', color: '#8b2d2d', bg: '#f4d5d5' },
  vencida: { label: 'Vencida', color: '#5f4b41', bg: '#f0e2d8' },
  completada: { label: 'Completada', color: '#9f2d46', bg: '#f7dfe4' },
  'no asistio': { label: 'No asistió', color: '#6e4d35', bg: '#f6e8d8' },
  'reprogramacion solicitada': { label: 'Reprogramación', color: '#5f3d69', bg: '#f0e4f4' },
  reprogramada: { label: 'Reprogramada', color: '#214f63', bg: '#dfeff4' },
};

const clientNames = [
  'Camila Restrepo',
  'Mariana Gómez',
  'Laura Zapata',
  'Isabela Duque',
  'Sofía Arango',
  'Paula Cardona',
  'Lucía Pérez',
  'Daniela M.',
  'Andrea R.',
  'Valentina C.',
];

const serviceNames = [
  'Masaje relajante',
  'Alisado orgánico',
  'Facial hidratante',
  'Manicure y pedicure spa',
  'Masaje relajante',
  'Facial hidratante',
  'Masaje relajante',
  'Alisado orgánico',
  'Facial hidratante',
  'Manicure y pedicure spa',
];

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

export default function HistoryPage() {
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const query = useMemo(
    () => ({
      status: (status || undefined) as Appointment['status'] | undefined,
      from: dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined,
      to: dateTo ? new Date(`${dateTo}T23:59:59`) : undefined,
      page,
      pageSize: 10,
    }),
    [status, dateFrom, dateTo, page],
  );

  const result = getAppointmentHistory(query);
  const total = result.total;

  const rows = result.items.map((item, index) => ({
    ...item,
    clientName: clientNames[index % clientNames.length] ?? 'Cliente',
    serviceName: serviceNames[index % serviceNames.length] ?? 'Servicio',
  }));

  const resetFilters = () => {
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="flex min-h-screen bg-[#f3f0ef] text-[#2b2b2b]">
      <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col bg-[#17171a] px-4 py-5 text-[#f6f3f2]">
        <div className="mb-6 text-[11px] uppercase tracking-[0.18em] text-[#f2f2f0]/80">
          BELLAS • Panel del spa
        </div>

        <div className="mb-7 pl-2">
          <div className="font-serif text-5xl font-bold tracking-[0.1em] text-[#f5f0ef]">BELLAS</div>
          <div className="mt-2 text-sm text-[#d7d2d0]">Panel del spa</div>
        </div>

        <nav className="mt-3 space-y-2">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[#e8e1df] opacity-90">
            <span className="text-lg">◫</span>
            <span>Citas pendientes</span>
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f1d6d4] px-1 text-[11px] font-semibold text-[#1d1d1d]">
              6
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[#e8e1df] opacity-90">
            <span className="text-lg">✕</span>
            <span>Citas canceladas</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[#e8e1df] opacity-90">
            <span className="text-lg">◌</span>
            <span>Insumos</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-[#e8dbd7] px-3 py-2.5 font-semibold text-[#1f1d1d] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
            <span className="text-lg">◔</span>
            <span>Historial de citas</span>
          </div>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <Button variant="outline" className="w-full justify-center rounded-xl border border-white/20 bg-transparent text-[#f3eceb] hover:bg-white/5">
            <span className="mr-2">↩</span>
            Ver como cliente
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto px-7 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[11px] font-semibold tracking-[0.08em] text-[#7d6966] uppercase">
            Bellas · Panel del spa
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-[#ddd2cf] bg-[#f6f3f2] text-[#534b49]">
              ✦
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-[#ddd2cf] bg-[#f6f3f2] text-[#534b49]">
              ◍
            </Button>
            <Button className="rounded-xl border border-[#3a3132] bg-[#1f1f21] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#2a2a2d]">
              Copiar enlace
            </Button>
          </div>
        </div>

        <div className="rounded-[22px] bg-[#f7f2ef] p-6">
          <h1 className="font-serif text-[52px] font-bold leading-[1.1] text-[#d56572]">Historial de citas</h1>
          <p className="mt-4 mb-6 text-lg text-[#4a4a4a]">Todas las citas realizadas, con su profesional y estado.</p>

          <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#efe6e0] px-5 py-4">
            <span className="text-[38px] font-bold text-[#2b2b2b]">{total}</span>
            <span className="text-lg text-[#373737]">Total de citas: {total}</span>
          </div>

          <div className="mb-5 flex gap-2.5">
            <Button variant="outline" className="rounded-xl border-[#d9c8c3] bg-[#f4ece9] px-5 text-[#312d2d] hover:bg-[#f4ece9]">
              Listado
            </Button>
            <Button variant="outline" className="rounded-xl border-[#d9c8c3] bg-[#f5f1ed] px-5 text-[#312d2d] hover:bg-[#f5f1ed]">
              Resumen
            </Button>
          </div>

          <div className="mb-5 grid gap-3 rounded-xl bg-[#efe8e3] p-4 md:grid-cols-[1.2fr_1.2fr_1fr_auto]">
            <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
              <span>Fecha desde</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl border-[#d9c8c3] bg-[#f5f2f0] text-[#333]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
              <span>Fecha hasta</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl border-[#d9c8c3] bg-[#f5f2f0] text-[#333]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
              <span>Estado</span>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
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

            <Button
              variant="outline"
              onClick={resetFilters}
              className="mt-auto h-11 rounded-xl border-[#d9c8c3] bg-[#f5f2f0] text-[#3c3332] hover:bg-[#f5f2f0]"
            >
              Limpiar filtros
            </Button>
          </div>

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
                    const meta = statusMeta[row.status] ?? {
                      label: row.status,
                      color: '#4d4d4d',
                      bg: '#efefef',
                    };

                    return (
                      <TableRow key={row.id} className={index % 2 === 0 ? 'bg-[#f6f2ef]' : 'bg-[#f9f6f4]'}>
                        <TableCell className="px-4 py-4 text-[15px] text-[#2b2b2b]">
                          <Link href={`/admin/appointments/history/${row.id}`} className="underline decoration-dotted underline-offset-4 hover:text-[#d56572]">
                            {row.clientName}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-[15px] text-[#2b2b2b]">{row.serviceName}</TableCell>
                        <TableCell className="px-4 py-4 text-[15px] text-[#2b2b2b]">{formatDate(row.scheduledStart)}</TableCell>
                        <TableCell className="px-4 py-4 text-[15px] text-[#2b2b2b]">{formatHour(row.scheduledStart)}</TableCell>
                        <TableCell className="px-4 py-4">
                          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ color: meta.color, backgroundColor: meta.bg }}>
                            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                            {meta.label}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-[15px] text-[#2b2b2b]">
                          {['Andrea R.', 'Daniela M.', 'Lucía P.', 'Paula C.'][index % 4]}
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
              <Button
                variant="outline"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1}
                className="rounded-lg border-[#d9c8c3] bg-[#f5f2f0] text-[#3c3332] disabled:opacity-50"
              >
                Anterior
              </Button>
              <span className="text-sm text-[#4a423f]">
                Página {result.page} de {result.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((value) => Math.min(result.totalPages, value + 1))}
                disabled={page >= result.totalPages}
                className="rounded-lg border-[#d9c8c3] bg-[#f5f2f0] text-[#3c3332] disabled:opacity-50"
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


