"use client";

import { useEffect, useState } from 'react';
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
      <main className="flex-1 overflow-hidden px-8 py-7">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Bellas · Panel del spa
          </div>
        </div>

        <div className="h-[calc(100vh-120px)] overflow-y-auto rounded-[28px] bg-background p-5 shadow-[0_0_0_1px_rgba(104,76,72,0.03)]">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Inventario</p>
              <h1 className="mt-2 font-serif text-[40px] leading-[0.96] tracking-[-0.04em] text-foreground sm:text-[44px] lg:text-[48px]">
                Insumos del spa
              </h1>
            </div>

            <div className="rounded-xl bg-surface-soft px-4 py-2 text-sm font-medium text-body">
              {lowStockCount} bajo stock
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Insumos</p>
              <p className="mt-3 text-3xl font-bold text-foreground">{supplies.length}</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Stock total</p>
              <p className="mt-3 text-3xl font-bold text-foreground">{formatNumber(totalAvailable)}</p>
            </div>
            <div className="rounded-2xl border border-line bg-brand-soft p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Por reponer</p>
              <p className="mt-3 text-3xl font-bold text-danger">{lowStockCount}</p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <SupplyForm onSaved={() => { void refreshSupplies(); }} />
            <InventoryMovementForm supplies={supplies} onSaved={() => { void refreshSupplies(); }} />
          </div>

          {loadError ? (
            <p role="alert" className="mb-4 rounded-xl border border-line bg-brand-soft px-4 py-3 text-sm text-danger">
              {loadError}
            </p>
          ) : null}

          <section className="overflow-hidden rounded-2xl border border-line bg-background shadow-sm">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-surface-soft">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-body">Insumo</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-body">Unidad</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-body">Cantidad</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-body">Stock mínimo</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-body">Estado</th>
                </tr>
              </thead>
              <tbody>
                {supplies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-body">No hay insumos registrados.</td>
                  </tr>
                ) : (
                  supplies.map((supply, index) => (
                    <tr key={supply.id} className={index % 2 === 0 ? 'bg-surface-warm' : 'bg-surface-warm'}>
                      <td className="px-4 py-4 text-foreground">{supply.name}</td>
                      <td className="px-4 py-4 text-foreground">{supply.unit}</td>
                      <td className="px-4 py-4 text-foreground">{formatNumber(supply.quantityAvailable)}</td>
                      <td className="px-4 py-4 text-foreground">{formatNumber(supply.minimumThreshold)}</td>
                      <td className="px-4 py-4">
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: supply.isLowStock ? 'var(--danger-soft)' : 'var(--success-soft)',
                            color: supply.isLowStock ? 'var(--danger)' : 'var(--success-text)',
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
  );
}
