"use client";

import { useState, type FormEvent } from 'react';

export function InventoryMovementForm({
  supplies,
  onSaved,
}: {
  supplies: Array<{ id: string; name: string; quantityAvailable: number }>;
  onSaved?: () => void;
}) {
  const defaultSupplyId = supplies[0]?.id ?? '';
  const [form, setForm] = useState({
    supplyId: defaultSupplyId,
    type: 'entrada' as 'entrada' | 'consumo' | 'correccion',
    quantity: 1,
    reason: '',
    allowsNegativeStock: false,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedSupplyId = form.supplyId || defaultSupplyId;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/supplies/${selectedSupplyId}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          quantity: Number(form.quantity),
          reason: form.reason,
          allowsNegativeStock: form.allowsNegativeStock,
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'No se pudo registrar el movimiento.');

      setMessage('Movimiento registrado correctamente.');
      setForm((current) => ({
        ...current,
        quantity: 1,
        reason: '',
        allowsNegativeStock: false,
      }));
      onSaved?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo registrar el movimiento.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-[#efe8e3] p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#2b2b2b]">Entrada / salida de stock</h2>
        <p className="mt-1 text-sm text-[#6a5d5a]">
          Úsalo para sumar o restar unidades de un insumo ya registrado (compra, consumo o corrección).
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
          <span>Insumo</span>
          <select
            required
            value={selectedSupplyId}
            onChange={(event) => setForm((current) => ({ ...current, supplyId: event.target.value }))}
            className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
          >
            {supplies.length === 0 ? (
              <option value="">Sin insumos</option>
            ) : (
              supplies.map((supply) => (
                <option key={supply.id} value={supply.id}>
                  {supply.name}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
          <span>Tipo</span>
          <select
            value={form.type}
            onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as 'entrada' | 'consumo' | 'correccion' }))}
            className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
          >
            <option value="entrada">Entrada</option>
            <option value="consumo">Consumo</option>
            <option value="correccion">Corrección</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
          <span>Cantidad del movimiento</span>
          <input
            type="number"
            min={1}
            required
            aria-label="Cantidad del movimiento"
            value={form.quantity}
            onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
            className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
          <span>Excepción de stock negativo</span>
          <select
            value={form.allowsNegativeStock ? 'si' : 'no'}
            onChange={(event) => setForm((current) => ({ ...current, allowsNegativeStock: event.target.value === 'si' }))}
            className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
          >
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </label>
      </div>

      <label className="mt-3 flex flex-col gap-2 text-sm text-[#473e3d]">
        <span>Motivo</span>
        <textarea
          required
          minLength={3}
          value={form.reason}
          onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
          className="min-h-24 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] p-3"
          placeholder="Compra semanal, uso de tratamiento, ajuste por corte..."
        />
      </label>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={isSaving || supplies.length === 0}
          className="rounded-xl bg-[#1f1f21] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? 'Guardando…' : 'Registrar entrada/salida'}
        </button>
        {message ? <span className="text-sm text-[#4a423f]">{message}</span> : null}
      </div>
    </form>
  );
}
