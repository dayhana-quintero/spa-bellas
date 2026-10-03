"use client";

import { useEffect, useState } from 'react';

import { listSupplies } from '@/domain/inventory/inventory-service';

import { InventoryMovementForm } from './inventory-movement-form';
import { SupplyForm } from './supply-form';

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-ES').format(value);
}

export default function InventoryPage() {
  const [supplies, setSupplies] = useState(() => [] as ReturnType<typeof listSupplies>);

  useEffect(() => {
    setSupplies(listSupplies());
  }, []);

  const lowStockCount = supplies.filter((supply) => supply.isLowStock).length;
  const totalAvailable = supplies.reduce((sum, supply) => sum + supply.quantityAvailable, 0);

  return (
    <main className="min-h-screen bg-[#f6f1ee] p-6 text-[#2b2b2b]">
      <div className="mx-auto max-w-6xl rounded-[28px] bg-[#faf6f3] p-6 shadow-sm">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d6966]">Inventario</p>
            <h1 className="mt-2 font-serif text-4xl text-[#d56572]">Insumos del spa</h1>
          </div>
          <div className="rounded-xl bg-[#efe8e3] px-4 py-2 text-sm text-[#433d3b]">
            {lowStockCount} bajo stock
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-[#efe8e3] p-4">
            <p className="text-sm text-[#6b5f5d]">Insumos</p>
            <p className="mt-2 text-3xl font-bold">{supplies.length}</p>
          </div>
          <div className="rounded-2xl bg-[#efe8e3] p-4">
            <p className="text-sm text-[#6b5f5d]">Stock total</p>
            <p className="mt-2 text-3xl font-bold">{formatNumber(totalAvailable)}</p>
          </div>
          <div className="rounded-2xl bg-[#f3d7d7] p-4">
            <p className="text-sm text-[#6b5f5d]">Revisión requerida</p>
            <p className="mt-2 text-3xl font-bold text-[#8a5757]">{lowStockCount}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <SupplyForm onSaved={() => setSupplies(listSupplies())} />
          <InventoryMovementForm supplies={supplies} onSaved={() => setSupplies(listSupplies())} />
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#d9c8c3] bg-[#f7f2ef]">
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
  );
}
