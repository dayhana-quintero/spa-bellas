import Link from 'next/link';

import { getPublicCatalog } from '@/domain/services/public-catalog';

export default function PublicServicesPage() {
  const services = getPublicCatalog();

  return (
    <main className="min-h-screen bg-[#f5f0ee] px-6 py-10 text-[#1f1b1b]">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d6966]">
          Bellas Spa
        </p>
        <h1 className="mt-4 font-serif text-5xl text-[#d56572]">Servicios disponibles</h1>
        <p className="mt-3 max-w-2xl text-lg text-[#433c3b]">
          Explora los tratamientos disponibles y elige el que mejor se adapte a tus necesidades.
        </p>

        {services.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[#d7c6c2] bg-white/50 p-8 text-center text-[#564d4c]">
            No hay servicios disponibles en este momento.
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article key={service.id} className="rounded-3xl border border-[#e7d8d3] bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f69]">
                  {service.category}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-[#2b2b2b]">{service.name}</h2>
                <p className="mt-3 text-sm leading-6 text-[#4a4342]">{service.description}</p>

                <div className="mt-5 flex items-center justify-between gap-3 text-sm text-[#453d3c]">
                  <span>{service.estimatedDuration ?? 60} min</span>
                  <span className="font-semibold text-[#d56572]">{service.priceDisplay ?? 'Consultar'}</span>
                </div>

                <div className="mt-5 flex gap-3">
                  <Link
                    href={`/public/services/${service.id}`}
                    className="flex-1 rounded-xl bg-[#1f1f21] px-4 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Ver detalles
                  </Link>
                  <Link
                    href={`/public/appointments?serviceId=${service.id}`}
                    className="flex-1 rounded-xl border border-[#d8c7c2] bg-[#f4ece9] px-4 py-2.5 text-center text-sm font-medium text-[#2d2828]"
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
