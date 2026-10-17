"use client";

import { useState, type FormEvent } from 'react';

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
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/supplies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          category: form.category.trim() || undefined,
          unit: form.unit.trim(),
          quantityAvailable: Number(form.quantityAvailable),
          minimumThreshold: Number(form.minimumThreshold),
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'No se pudo guardar el insumo.');

      setMessage('Insumo guardado correctamente.');
      setForm(emptyForm);
      onSaved?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el insumo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-surface-soft p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Nuevo insumo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Úsalo solo la primera vez, para registrar un insumo que aún no existe en el catálogo.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-body">
          <span>Nombre</span>
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="h-10 rounded-xl border border-line bg-surface-warm px-3"
            placeholder="Ej. Aceite relajante"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-body">
          <span>Categoría</span>
          <input
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            className="h-10 rounded-xl border border-line bg-surface-warm px-3"
            placeholder="Cosméticos"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-body">
          <span>Unidad</span>
          <input
            required
            value={form.unit}
            onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
            className="h-10 rounded-xl border border-line bg-surface-warm px-3"
            placeholder="botellas"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-body">
          <span>Estado</span>
          <select
            value={form.isActive ? 'activo' : 'inactivo'}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === 'activo' }))}
            className="h-10 rounded-xl border border-line bg-surface-warm px-3"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-body">
          <span>Stock disponible</span>
          <input
            type="number"
            min={0}
            aria-label="Stock disponible"
            value={form.quantityAvailable}
            onChange={(event) => setForm((current) => ({ ...current, quantityAvailable: Number(event.target.value) }))}
            className="h-10 rounded-xl border border-line bg-surface-warm px-3"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-body">
          <span>Stock mínimo</span>
          <input
            type="number"
            min={0}
            value={form.minimumThreshold}
            onChange={(event) => setForm((current) => ({ ...current, minimumThreshold: Number(event.target.value) }))}
            className="h-10 rounded-xl border border-line bg-surface-warm px-3"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-strong px-4 py-2 text-sm font-semibold text-strong-fg"
        >
          {isSaving ? 'Guardando…' : 'Guardar nuevo insumo'}
        </button>
        {message ? <span className="text-sm text-body">{message}</span> : null}
      </div>
    </form>
  );
}
