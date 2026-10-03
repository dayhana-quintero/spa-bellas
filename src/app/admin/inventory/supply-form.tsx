"use client";

import { useState, type FormEvent } from 'react';

import { saveSupply } from '@/domain/spa-service';

const emptyForm = {
  name: '',
  category: '',
  unit: '',
  quantityAvailable: 0,
  minimumThreshold: 0,
  isActive: true,
};

export function SupplyForm({ onSaved }: { onSaved?: () => void }) {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      saveSupply({
        ...form,
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        unit: form.unit.trim(),
        quantityAvailable: Number(form.quantityAvailable),
        minimumThreshold: Number(form.minimumThreshold),
      });

      setMessage('Insumo guardado correctamente.');
      setForm(emptyForm);
      onSaved?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el insumo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-[#efe8e3] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#2b2b2b]">Agregar insumo</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
          <span>Nombre</span>
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
            placeholder="Ej. Aceite relajante"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
          <span>Categoría</span>
          <input
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
            placeholder="Cosméticos"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
          <span>Unidad</span>
          <input
            required
            value={form.unit}
            onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
            className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
            placeholder="botellas"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
          <span>Estado</span>
          <select
            value={form.isActive ? 'activo' : 'inactivo'}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === 'activo' }))}
            className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
          <span>Stock disponible</span>
          <input
            type="number"
            min={0}
            aria-label="Stock disponible"
            value={form.quantityAvailable}
            onChange={(event) => setForm((current) => ({ ...current, quantityAvailable: Number(event.target.value) }))}
            className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
          <span>Umbral mínimo</span>
          <input
            type="number"
            min={0}
            value={form.minimumThreshold}
            onChange={(event) => setForm((current) => ({ ...current, minimumThreshold: Number(event.target.value) }))}
            className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="submit"
          className="rounded-xl bg-[#1f1f21] px-4 py-2 text-sm font-semibold text-white"
        >
          Guardar insumo
        </button>
        {message ? <span className="text-sm text-[#4a423f]">{message}</span> : null}
      </div>
    </form>
  );
}
