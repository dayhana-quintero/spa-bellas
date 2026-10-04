"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Supply } from '@/shared/types/supply';

import { InventoryMovementForm } from './inventory-movement-form';
import { SupplyForm } from './supply-form';

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-ES').format(value);
}

export default function InventoryPage() {
  const [supplies, setSupplies] = useState<Array<Supply & { isLowStock: boolean; movements: [] }>>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchSupplies = async () => {
    const response = await fetch('/api/admin/supplies');
    const result = await response.json() as Array<Supply & { isLowStock: boolean; movements: [] }> | { error?: string };
    if (!response.ok || !Array.isArray(result)) {
      throw new Error(!Array.isArray(result) ? result.error : undefined);
    }
    return result;
  };

  const refreshSupplies = async () => {
    try {
      setSupplies(await fetchSupplies());
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el inventario.');
    }
  };

  useEffect(() => {
    let isMounted = true;
    void fetchSupplies().then((nextSupplies) => {
      if (isMounted) setSupplies(nextSupplies);
    }).catch((error: unknown) => {
      if (isMounted) setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el inventario.');
    });
    return () => { isMounted = false; };
  }, []);

  const lowStockCount = supplies.filter((supply) => supply.isLowStock).length;
  const totalAvailable = supplies.reduce((sum, supply) => sum + supply.quantityAvailable, 0);

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#f3f0ef] text-[#2a2423]">
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
          <Link href="/admin" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] text-[#ece4e1] opacity-80 hover:bg-[#2b2b2f]">
            <span className="text-lg">📅</span>
            <span>Citas pendientes</span>
          </Link>
          <Link href="/admin?status=confirmada" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] text-[#ece4e1] opacity-80 hover:bg-[#2b2b2f]">
            <span className="text-lg">✓</span>
            <span>Citas confirmadas</span>
          </Link>
          <Link href="/admin/inventory" className="flex w-full items-center gap-3 rounded-xl bg-[#2b2b2f] px-3 py-3 text-left text-[15px] font-medium text-[#f5f0ef] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
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
            <a href="/admin" className="rounded-xl border border-[#d9c9c4] bg-[#f7f3f2] px-3 py-2 text-sm font-medium text-[#4f4744] hover:bg-[#efe7e4]">
              Volver al panel
            </a>
          </div>
        </div>

        <div className="h-[calc(100vh-120px)] overflow-y-auto rounded-[28px] bg-[#f7f2ef] p-5 shadow-[0_0_0_1px_rgba(104,76,72,0.03)]">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Inventario</p>
              <h1 className="mt-2 font-serif text-[40px] leading-[0.96] tracking-[-0.04em] text-[#d56572] sm:text-[44px] lg:text-[48px]">
                Insumos del spa
              </h1>
            </div>

            <div className="rounded-xl bg-[#efe8e3] px-4 py-2 text-sm font-medium text-[#433d3b]">
              {lowStockCount} bajo stock
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Insumos</p>
              <p className="mt-3 text-3xl font-bold text-[#2a2323]">{supplies.length}</p>
            </div>
            <div className="rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Stock total</p>
              <p className="mt-3 text-3xl font-bold text-[#2a2323]">{formatNumber(totalAvailable)}</p>
            </div>
            <div className="rounded-2xl border border-[#f0d0cd] bg-[#fff5f3] p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">Revisión</p>
              <p className="mt-3 text-3xl font-bold text-[#8a5757]">{lowStockCount}</p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <SupplyForm onSaved={() => { void refreshSupplies(); }} />
            <InventoryMovementForm supplies={supplies} onSaved={() => { void refreshSupplies(); }} />
          </div>

          {loadError ? (
            <p role="alert" className="mb-4 rounded-xl border border-[#e3aaa3] bg-[#fff5f3] px-4 py-3 text-sm text-[#8a3f3a]">
              {loadError}
            </p>
          ) : null}

          <section className="overflow-hidden rounded-2xl border border-[#d9c8c3] bg-[#f7f2ef] shadow-sm">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-[#efe8e3]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#4a423f]">Insumo</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#4a423f]">Unidad</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#4a423f]">Cantidad</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#4a423f]">Umbral</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-[#4a423f]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {supplies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-[#544a48]">No hay insumos registrados.</td>
                  </tr>
                ) : (
                  supplies.map((supply, index) => (
                    <tr key={supply.id} className={index % 2 === 0 ? 'bg-[#f9f5f3]' : 'bg-[#f6f2ef]'}>
                      <td className="px-4 py-4 text-[#2b2b2b]">{supply.name}</td>
                      <td className="px-4 py-4 text-[#2b2b2b]">{supply.unit}</td>
                      <td className="px-4 py-4 text-[#2b2b2b]">{formatNumber(supply.quantityAvailable)}</td>
                      <td className="px-4 py-4 text-[#2b2b2b]">{formatNumber(supply.minimumThreshold)}</td>
                      <td className="px-4 py-4">
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: supply.isLowStock ? '#f8d8d2' : '#dff5ea',
                            color: supply.isLowStock ? '#8a5757' : '#2e7d5e',
                          }}
                        >
                          {supply.isLowStock ? 'Bajo stock' : 'En stock'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
}
