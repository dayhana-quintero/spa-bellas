'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';

import {
  listAdminServices,
  saveAdminService,
  toggleServiceBooking,
  toggleServicePublication,
} from '@/domain/services/admin-service-catalog';
import type { Service } from '@/shared/types/service';

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

export default function AdminServicesCatalogPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [draft, setDraft] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setServices(listAdminServices());
  }, []);

  const publishedCount = useMemo(
    () => services.filter((service) => service.isActive && service.isBookable).length,
    [services],
  );

  const loadServices = () => setServices(listAdminServices());

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      saveAdminService({
        ...draft,
        id: draft.id || undefined,
        category: draft.category,
        name: draft.name,
        description: draft.description,
        estimatedDuration: Number(draft.estimatedDuration) || undefined,
        priceDisplay: draft.priceDisplay || undefined,
        isActive: draft.isActive,
        isBookable: draft.isBookable,
      });

      setMessage(draft.id ? 'Servicio actualizado correctamente.' : 'Servicio guardado correctamente.');
      setError(null);
      setDraft(emptyForm);
      loadServices();
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

  const handleTogglePublication = (id: string) => {
    try {
      toggleServicePublication(id);
      loadServices();
      setMessage('Estado de publicación actualizado.');
      setError(null);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'No se pudo actualizar el servicio.');
    }
  };

  const handleToggleBooking = (id: string) => {
    try {
      toggleServiceBooking(id);
      loadServices();
      setMessage('Disponibilidad del servicio actualizada.');
      setError(null);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'No se pudo actualizar la disponibilidad.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f0ee] px-6 py-8 text-[#2b2b2b]">
      <div className="mx-auto max-w-6xl rounded-[28px] bg-[#faf7f4] p-6 shadow-sm">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d6966]">Catálogo</p>
            <h1 className="mt-2 font-serif text-4xl text-[#d56572]">Servicios del spa</h1>
          </div>
          <div className="rounded-xl bg-[#efe8e3] px-4 py-2 text-sm text-[#433d3b]">
            {publishedCount} publicados
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="rounded-2xl bg-[#efe8e3] p-4">
            <h2 className="mb-4 text-lg font-semibold text-[#2b2b2b]">
              {draft.id ? 'Editar servicio' : 'Agregar servicio'}
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-[#473e3d] md:col-span-2">
                <span>Categoría</span>
                <input
                  required
                  value={draft.category}
                  onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                  className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
                  placeholder="Masajes"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-[#473e3d] md:col-span-2">
                <span>Nombre</span>
                <input
                  required
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
                  placeholder="Masaje relajante"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-[#473e3d] md:col-span-2">
                <span>Descripción</span>
                <textarea
                  required
                  minLength={15}
                  value={draft.description}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-24 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] p-3"
                  placeholder="Describe tu servicio con detalle para la cliente."
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
                <span>Duración (min)</span>
                <input
                  type="number"
                  min={1}
                  value={draft.estimatedDuration}
                  onChange={(event) => setDraft((current) => ({ ...current, estimatedDuration: event.target.value }))}
                  className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
                <span>Precio</span>
                <input
                  value={draft.priceDisplay}
                  onChange={(event) => setDraft((current) => ({ ...current, priceDisplay: event.target.value }))}
                  className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
                  placeholder="$1.200"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
                <span>Publicar</span>
                <select
                  value={draft.isActive ? 'activo' : 'inactivo'}
                  onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.value === 'activo' }))}
                  className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-[#473e3d]">
                <span>Agendable</span>
                <select
                  value={draft.isBookable ? 'si' : 'no'}
                  onChange={(event) => setDraft((current) => ({ ...current, isBookable: event.target.value === 'si' }))}
                  className="h-10 rounded-xl border border-[#d9c8c3] bg-[#f9f4f2] px-3"
                >
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="submit"
                className="rounded-xl bg-[#1f1f21] px-4 py-2 text-sm font-semibold text-white"
              >
                {draft.id ? 'Guardar cambios' : 'Guardar servicio'}
              </button>
              {message ? <span className="text-sm text-[#4a423f]">{message}</span> : null}
              {error ? <span className="text-sm text-[#8a5757]">{error}</span> : null}
            </div>
          </form>

          <section className="rounded-2xl bg-[#f7f2ef] p-4">
            <h2 className="mb-4 text-lg font-semibold text-[#2b2b2b]">Servicios actuales</h2>

            <div className="space-y-3">
              {services.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d9c8c3] p-6 text-center text-[#544a48]">
                  No hay servicios configurados.
                </div>
              ) : (
                services.map((service) => (
                  <article key={service.id} className="rounded-2xl border border-[#e0d2ce] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f69]">{service.category}</p>
                        <h3 className="mt-2 text-xl font-semibold text-[#2b2b2b]">{service.name}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePublication(service.id)}
                          className="rounded-xl border border-[#d9c8c3] px-2 py-1 text-xs font-medium text-[#2b2b2b]"
                        >
                          {service.isActive ? 'Desactivar' : 'Publicar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBooking(service.id)}
                          className="rounded-xl border border-[#d9c8c3] px-2 py-1 text-xs font-medium text-[#2b2b2b]"
                        >
                          {service.isBookable ? 'Cerrar agenda' : 'Abrir agenda'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(service)}
                          className="rounded-xl bg-[#1f1f21] px-2 py-1 text-xs font-medium text-white"
                        >
                          Editar
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[#4a4342]">{service.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#4a423f]">
                      <span className="rounded-full bg-[#efe8e3] px-2 py-1">
                        {service.estimatedDuration ? `${service.estimatedDuration} min` : 'Sin duración'}
                      </span>
                      <span className="rounded-full bg-[#efe8e3] px-2 py-1">
                        {service.isActive ? 'Visible' : 'Oculto'}
                      </span>
                      <span className="rounded-full bg-[#efe8e3] px-2 py-1">
                        {service.isBookable ? 'Agendable' : 'No agendable'}
                      </span>
                      {service.priceDisplay ? (
                        <span className="rounded-full bg-[#efe8e3] px-2 py-1">{service.priceDisplay}</span>
                      ) : null}
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
