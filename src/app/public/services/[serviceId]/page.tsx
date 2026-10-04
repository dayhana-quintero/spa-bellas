import Link from 'next/link';

import { getPublicServiceById } from '@/domain/services/public-catalog';

export default async function PublicServiceDetailPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const service = await getPublicServiceById(serviceId);

  if (!service) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f0ee] px-6 py-10">
        <div className="rounded-3xl border border-[#e7d8d3] bg-white p-8 text-center shadow-sm">
          <h1 className="font-serif text-4xl text-[#d56572]">Servicio no encontrado</h1>
          <p className="mt-3 text-[#4a4342]">El servicio solicitado no está disponible actualmente.</p>
          <Link href="/public/services" className="mt-6 inline-block rounded-xl bg-[#1f1f21] px-4 py-2.5 text-white">
            Volver al catalogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f0ee] px-6 py-10 text-[#1f1b1b]">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#e7d8d3] bg-white p-8 shadow-sm">
        <Link href="/public/services" className="text-sm font-medium text-[#6d5a56] underline-offset-4 hover:underline">
          ← Volver al catálogo
        </Link>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6f69]">
              {service.category}
            </p>
            <h1 className="mt-3 font-serif text-5xl text-[#d56572]">{service.name}</h1>
          </div>
          <div className="rounded-2xl bg-[#f8efee] px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-[#7d6966]">Precio</p>
            <p className="mt-2 text-2xl font-semibold text-[#2b2b2b]">{service.priceDisplay ?? 'Consultar'}</p>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#433c3b]">{service.description}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f7f2ef] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#7d6966]">Duración</p>
            <p className="mt-2 text-xl font-semibold text-[#2b2b2b]">{service.estimatedDuration ?? 60} min</p>
          </div>
          <div className="rounded-2xl bg-[#f7f2ef] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#7d6966]">Estado</p>
            <p className="mt-2 text-xl font-semibold text-[#2b2b2b]">
              {service.isActive && service.isBookable ? 'Disponible' : 'No disponible'}
            </p>
          </div>
          <div className="rounded-2xl bg-[#f7f2ef] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#7d6966]">Reservas</p>
            <p className="mt-2 text-xl font-semibold text-[#2b2b2b]">
              {service.isBookable ? 'Abiertas' : 'Cerradas'}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/public/appointments?serviceId=${service.id}`}
            className="rounded-xl bg-[#1f1f21] px-5 py-3 text-sm font-medium text-white"
          >
            Agendar este servicio
          </Link>
          <Link
            href="/public/services"
            className="rounded-xl border border-[#d8c7c2] bg-[#f4ece9] px-5 py-3 text-sm font-medium text-[#2d2828]"
          >
            Ver más servicios
          </Link>
        </div>
      </div>
    </main>
  );
}
