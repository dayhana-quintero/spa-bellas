import Link from 'next/link';

import { getPublicCatalog } from '@/domain/services/public-catalog';
import { formatDuration } from '@/shared/format-duration';

export default async function PublicServicesPage() {
  const services = await getPublicCatalog();

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Bellas Spa
        </p>
        <h1 className="mt-4 font-serif text-5xl text-brand">Servicios disponibles</h1>
        <p className="mt-3 max-w-2xl text-lg text-body">
          Explora los tratamientos disponibles y elige el que mejor se adapte a tus necesidades.
        </p>

        {services.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-surface/50 p-8 text-center text-body">
            No hay servicios disponibles en este momento.
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article key={service.id} className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {service.category}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-foreground">{service.name}</h2>
                <p className="mt-3 text-sm leading-6 text-body">{service.description}</p>

                <div className="mt-5 flex items-center justify-between gap-3 text-sm text-body">
                  <span>{formatDuration(service.estimatedDuration ?? 60)}</span>
                  <span className="font-semibold text-brand">{service.priceDisplay ?? 'Consultar'}</span>
                </div>

                <div className="mt-5 flex gap-3">
                  <Link
                    href={`/public/services/${service.id}`}
                    className="flex-1 rounded-xl bg-strong px-4 py-2.5 text-center text-sm font-medium text-strong-fg"
                  >
                    Ver detalles
                  </Link>
                  <Link
                    href={`/public/appointments?serviceId=${service.id}`}
                    className="flex-1 rounded-xl border border-line bg-surface-soft px-4 py-2.5 text-center text-sm font-medium text-foreground"
                  >
                    Agendar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
