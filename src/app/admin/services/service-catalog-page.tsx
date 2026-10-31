'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Service } from '@/shared/types/service';
import { formatDuration } from '@/shared/format-duration';

const emptyForm = {
  id: '',
  category: '',
  name: '',
  description: '',
  estimatedDuration: '60',
  priceDisplay: '',
  isActive: true,
  isBookable: true,
};

async function fetchServices(): Promise<Service[]> {
  const res = await fetch('/api/admin/services');
  if (!res.ok) throw new Error('No se pudo cargar los servicios.');
  const data = await res.json() as Service[];
  return Array.isArray(data) ? data : [];
}

export default function AdminServicesCatalogPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [draft, setDraft] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async () => {
    try {
      setServices(await fetchServices());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando servicios.');
    }
  };

  useEffect(() => {
    let isActive = true;

    fetchServices()
      .then((data) => {
        if (isActive) setServices(data);
      })
      .catch((err: unknown) => {
        if (isActive) setError(err instanceof Error ? err.message : 'Error cargando servicios.');
      });

    return () => {
      isActive = false;
    };
  }, []);

  const publishedCount = useMemo(
    () => services.filter((s) => s.isActive && s.isBookable).length,
    [services],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const method = draft.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draft.id || undefined,
          category: draft.category,
          name: draft.name,
          description: draft.description,
          estimatedDuration: Number(draft.estimatedDuration) || 60,
          priceDisplay: (() => {
            const raw = draft.priceDisplay.trim();
            if (!raw) return undefined;
            return raw.startsWith('$') ? raw : `$${raw}`;
          })(),
          isActive: draft.isActive,
          isBookable: draft.isBookable,
        }),
      });
      const result = await res.json() as { error?: string };
      if (!res.ok) throw new Error(result.error ?? 'No se pudo guardar el servicio.');
      setMessage(draft.id ? 'Servicio actualizado correctamente.' : 'Servicio guardado correctamente.');
      setError(null);
      setDraft(emptyForm);
      void loadServices();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar el servicio.');
      setMessage(null);
    }
  };

  const handleEdit = (service: Service) => {
    setDraft({
      id: service.id,
      category: service.category,
      name: service.name,
      description: service.description,
      estimatedDuration: String(service.estimatedDuration ?? 60),
      priceDisplay: service.priceDisplay ?? '',
      isActive: service.isActive,
      isBookable: service.isBookable,
    });
    setMessage(null);
    setError(null);
  };

  const handleToggle = async (id: string, field: 'isActive' | 'isBookable') => {
    const service = services.find((s) => s.id === id);
    if (!service) return;
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...service, [field]: !service[field] }),
      });
      const result = await res.json() as { error?: string };
      if (!res.ok) throw new Error(result.error ?? 'No se pudo actualizar el servicio.');
      setMessage('Servicio actualizado.');
      setError(null);
      void loadServices();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'No se pudo actualizar el servicio.');
    }
  };

  const handleDelete = async (service: Service) => {
    const confirmed = window.confirm(
      `¿Eliminar el servicio "${service.name}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/services/${service.id}`, { method: 'DELETE' });
      const result = await res.json() as { error?: string };
      if (!res.ok) throw new Error(result.error ?? 'No se pudo eliminar el servicio.');
      setMessage('Servicio eliminado correctamente.');
      setError(null);
      // Si el servicio eliminado estaba en el formulario, se limpia el borrador.
      if (draft.id === service.id) setDraft(emptyForm);
      void loadServices();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el servicio.');
      setMessage(null);
    }
  };

  return (
    <main className="flex-1 overflow-auto px-8 py-7">
      <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Bellas · Panel del spa
      </div>

      <div className="rounded-[28px] bg-background p-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Catálogo</p>
            <h1 className="mt-2 font-serif text-[48px] leading-[0.96] text-foreground">Servicios del spa</h1>
            <p className="mt-2 text-[16px] text-body">Crea, edita y gestiona los servicios disponibles.</p>
          </div>
          <div className="rounded-xl bg-surface-soft px-4 py-2 text-sm text-body">
            {publishedCount} publicados
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulario */}
          <form onSubmit={handleSubmit} className="rounded-2xl bg-surface-soft p-5">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {draft.id ? 'Editar servicio' : 'Agregar servicio'}
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm text-body md:col-span-2">
                <span>Categoría</span>
                <input
                  required
                  value={draft.category}
                  onChange={(e) => setDraft((c) => ({ ...c, category: e.target.value }))}
                  className="h-11 rounded-xl border border-line bg-surface-warm px-3 outline-none focus:border-brand"
                  placeholder="Masajes, Faciales, Uñas..."
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-body md:col-span-2">
                <span>Nombre</span>
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft((c) => ({ ...c, name: e.target.value }))}
                  className="h-11 rounded-xl border border-line bg-surface-warm px-3 outline-none focus:border-brand"
                  placeholder="Masaje relajante"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-body md:col-span-2">
                <span>Descripción</span>
                <textarea
                  required
                  minLength={15}
                  value={draft.description}
                  onChange={(e) => setDraft((c) => ({ ...c, description: e.target.value }))}
                  className="min-h-[90px] rounded-xl border border-line bg-surface-warm p-3 outline-none focus:border-brand"
                  placeholder="Describe el servicio para la cliente..."
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-body">
                <span>Duración (min)</span>
                <input
                  type="number"
                  min={1}
                  value={draft.estimatedDuration}
                  onChange={(e) => setDraft((c) => ({ ...c, estimatedDuration: e.target.value }))}
                  className="h-11 rounded-xl border border-line bg-surface-warm px-3 outline-none focus:border-brand"
                />
              </label>

              <div className="flex flex-col gap-1.5 text-sm text-body">
                <span>Precio</span>
                <div className="flex items-center rounded-xl border border-line bg-surface-warm focus-within:border-brand">
                  <span className="pl-3 pr-1 text-muted-foreground">$</span>
                  <input
                    inputMode="numeric"
                    value={draft.priceDisplay.replace(/^\$/, '')}
                    onChange={(e) => setDraft((c) => ({ ...c, priceDisplay: e.target.value.replace(/[^\d.,]/g, '') }))}
                    className="h-11 flex-1 rounded-xl bg-transparent px-2 outline-none"
                    placeholder="80.000"
                  />
                </div>
              </div>

              <label className="flex flex-col gap-1.5 text-sm text-body">
                <span>Publicar</span>
                <select
                  value={draft.isActive ? 'activo' : 'inactivo'}
                  onChange={(e) => setDraft((c) => ({ ...c, isActive: e.target.value === 'activo' }))}
                  className="h-11 rounded-xl border border-line bg-surface-warm px-3 outline-none"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-body">
                <span>Agendable</span>
                <select
                  value={draft.isBookable ? 'si' : 'no'}
                  onChange={(e) => setDraft((c) => ({ ...c, isBookable: e.target.value === 'si' }))}
                  className="h-11 rounded-xl border border-line bg-surface-warm px-3 outline-none"
                >
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-xl bg-strong px-5 py-2.5 text-sm font-semibold text-strong-fg hover:bg-strong-hover"
              >
                {draft.id ? 'Guardar cambios' : 'Guardar servicio'}
              </button>
              {draft.id && (
                <button
                  type="button"
                  onClick={() => { setDraft(emptyForm); setMessage(null); setError(null); }}
                  className="rounded-xl border border-line bg-background px-4 py-2.5 text-sm text-foreground"
                >
                  Cancelar
                </button>
              )}
              {message && <span className="text-sm text-success-text">{message}</span>}
              {error && <span className="text-sm text-danger">{error}</span>}
            </div>
          </form>

          {/* Lista de servicios */}
          <section className="rounded-2xl bg-background p-5">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Servicios actuales</h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {services.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-body">
                  No hay servicios configurados aún.
                </div>
              ) : (
                services.map((service) => (
                  <article key={service.id} className="rounded-2xl border border-line bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{service.category}</p>
                        <h3 className="mt-1 text-[17px] font-semibold text-foreground">{service.name}</h3>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => void handleToggle(service.id, 'isActive')}
                          className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-hover"
                        >
                          {service.isActive ? 'Desactivar' : 'Publicar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggle(service.id, 'isBookable')}
                          className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-hover"
                        >
                          {service.isBookable ? 'Cerrar agenda' : 'Abrir agenda'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(service)}
                          className="rounded-lg bg-strong px-2.5 py-1 text-xs font-medium text-strong-fg hover:bg-strong-hover"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(service)}
                          className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger-soft"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-body line-clamp-2">{service.description}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-body">
                      {service.estimatedDuration ? (
                        <span className="rounded-full bg-surface-soft px-2.5 py-1">{formatDuration(service.estimatedDuration)}</span>
                      ) : null}
                      {service.priceDisplay ? (
                        <span className="rounded-full bg-surface-soft px-2.5 py-1">{service.priceDisplay}</span>
                      ) : null}
                      <span className={`rounded-full px-2.5 py-1 ${service.isActive ? 'bg-success-soft text-success-text' : 'bg-danger-soft text-danger'}`}>
                        {service.isActive ? 'Visible' : 'Oculto'}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 ${service.isBookable ? 'bg-success-soft text-success-text' : 'bg-danger-soft text-danger'}`}>
                        {service.isBookable ? 'Agendable' : 'No agendable'}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
