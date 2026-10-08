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
      <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">
        Bellas · Panel del spa
      </div>

      <div className="rounded-[28px] bg-[#f7f2ef] p-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d6966]">Catálogo</p>
            <h1 className="mt-2 font-serif text-[48px] leading-[0.96] text-[#d56572]">Servicios del spa</h1>
            <p className="mt-2 text-[16px] text-[#504a49]">Crea, edita y gestiona los servicios disponibles.</p>
          </div>
          <div className="rounded-xl bg-[#efe8e3] px-4 py-2 text-sm text-[#433d3b]">
            {publishedCount} publicados
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulario */}
          <form onSubmit={handleSubmit} className="rounded-2xl bg-[#efe8e3] p-5">
            <h2 className="mb-4 text-lg font-semibold text-[#2b2b2b]">
              {draft.id ? 'Editar servicio' : 'Agregar servicio'}
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm text-[#473e3d] md:col-span-2">
                <span>Categoría</span>
                <input
                  required
                  value={draft.category}
                  onChange={(e) => setDraft((c) => ({ ...c, category: e.target.value }))}
                  className="h-11 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3 outline-none focus:border-[#d56572]"
                  placeholder="Masajes, Faciales, Uñas..."
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-[#473e3d] md:col-span-2">
                <span>Nombre</span>
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft((c) => ({ ...c, name: e.target.value }))}
                  className="h-11 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3 outline-none focus:border-[#d56572]"
                  placeholder="Masaje relajante"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-[#473e3d] md:col-span-2">
                <span>Descripción</span>
                <textarea
                  required
                  minLength={15}
                  value={draft.description}
                  onChange={(e) => setDraft((c) => ({ ...c, description: e.target.value }))}
                  className="min-h-[90px] rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] p-3 outline-none focus:border-[#d56572]"
                  placeholder="Describe el servicio para la cliente..."
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-[#473e3d]">
                <span>Duración (min)</span>
                <input
                  type="number"
                  min={1}
                  value={draft.estimatedDuration}
                  onChange={(e) => setDraft((c) => ({ ...c, estimatedDuration: e.target.value }))}
                  className="h-11 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3 outline-none focus:border-[#d56572]"
                />
              </label>

              <div className="flex flex-col gap-1.5 text-sm text-[#473e3d]">
                <span>Precio</span>
                <div className="flex items-center rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] focus-within:border-[#d56572]">
                  <span className="pl-3 pr-1 text-[#7d6966]">$</span>
                  <input
                    inputMode="numeric"
                    value={draft.priceDisplay.replace(/^\$/, '')}
                    onChange={(e) => setDraft((c) => ({ ...c, priceDisplay: e.target.value.replace(/[^\d.,]/g, '') }))}
                    className="h-11 flex-1 rounded-xl bg-transparent px-2 outline-none"
                    placeholder="80.000"
                  />
                </div>
              </div>

              <label className="flex flex-col gap-1.5 text-sm text-[#473e3d]">
                <span>Publicar</span>
                <select
                  value={draft.isActive ? 'activo' : 'inactivo'}
                  onChange={(e) => setDraft((c) => ({ ...c, isActive: e.target.value === 'activo' }))}
                  className="h-11 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3 outline-none"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-[#473e3d]">
                <span>Agendable</span>
                <select
                  value={draft.isBookable ? 'si' : 'no'}
                  onChange={(e) => setDraft((c) => ({ ...c, isBookable: e.target.value === 'si' }))}
                  className="h-11 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3 outline-none"
                >
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-xl bg-[#1f1f21] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a2a2d]"
              >
                {draft.id ? 'Guardar cambios' : 'Guardar servicio'}
              </button>
              {draft.id && (
                <button
                  type="button"
                  onClick={() => { setDraft(emptyForm); setMessage(null); setError(null); }}
                  className="rounded-xl border border-[#d9c8c3] bg-[#f5f2f0] px-4 py-2.5 text-sm text-[#3c3332]"
                >
                  Cancelar
                </button>
              )}
              {message && <span className="text-sm text-[#2e7d5e]">{message}</span>}
              {error && <span className="text-sm text-[#8a5757]">{error}</span>}
            </div>
          </form>

          {/* Lista de servicios */}
          <section className="rounded-2xl bg-[#f5f1ee] p-5">
            <h2 className="mb-4 text-lg font-semibold text-[#2b2b2b]">Servicios actuales</h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {services.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d9c8c3] p-8 text-center text-sm text-[#544a48]">
                  No hay servicios configurados aún.
                </div>
              ) : (
                services.map((service) => (
                  <article key={service.id} className="rounded-2xl border border-[#e0d2ce] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a6f69]">{service.category}</p>
                        <h3 className="mt-1 text-[17px] font-semibold text-[#2b2b2b]">{service.name}</h3>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => void handleToggle(service.id, 'isActive')}
                          className="rounded-lg border border-[#d9c8c3] px-2.5 py-1 text-xs font-medium text-[#2b2b2b] hover:bg-[#f0e8e4]"
                        >
                          {service.isActive ? 'Desactivar' : 'Publicar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggle(service.id, 'isBookable')}
                          className="rounded-lg border border-[#d9c8c3] px-2.5 py-1 text-xs font-medium text-[#2b2b2b] hover:bg-[#f0e8e4]"
                        >
                          {service.isBookable ? 'Cerrar agenda' : 'Abrir agenda'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(service)}
                          className="rounded-lg bg-[#1f1f21] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#2a2a2d]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(service)}
                          className="rounded-lg border border-[#d8b4b4] px-2.5 py-1 text-xs font-medium text-[#8b2d2d] hover:bg-[#f9e7e7]"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-[#4a4342] line-clamp-2">{service.description}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-[#4a423f]">
                      {service.estimatedDuration ? (
                        <span className="rounded-full bg-[#efe8e3] px-2.5 py-1">{formatDuration(service.estimatedDuration)}</span>
                      ) : null}
                      {service.priceDisplay ? (
                        <span className="rounded-full bg-[#efe8e3] px-2.5 py-1">{service.priceDisplay}</span>
                      ) : null}
                      <span className={`rounded-full px-2.5 py-1 ${service.isActive ? 'bg-[#dff5ea] text-[#1d6a4d]' : 'bg-[#f4d5d5] text-[#8b2d2d]'}`}>
                        {service.isActive ? 'Visible' : 'Oculto'}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 ${service.isBookable ? 'bg-[#dff5ea] text-[#1d6a4d]' : 'bg-[#f4d5d5] text-[#8b2d2d]'}`}>
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
