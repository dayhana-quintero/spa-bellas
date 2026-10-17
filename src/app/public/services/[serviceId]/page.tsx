import Link from 'next/link';

import { getPublicServiceById } from '@/domain/services/public-catalog';
import { formatDuration } from '@/shared/format-duration';

export default async function PublicServiceDetailPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const service = await getPublicServiceById(serviceId);

  if (!service) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
        <div className="rounded-3xl border border-line bg-surface p-8 text-center shadow-sm">
          <h1 className="font-serif text-4xl text-brand">Servicio no encontrado</h1>
          <p className="mt-3 text-body">El servicio solicitado no está disponible actualmente.</p>
          <Link href="/public/services" className="mt-6 inline-block rounded-xl bg-strong px-4 py-2.5 text-strong-fg">
            Volver al catalogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-line bg-surface p-8 shadow-sm">
        <Link href="/public/services" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
          ← Volver al catálogo
        </Link>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {service.category}
            </p>
            <h1 className="mt-3 font-serif text-5xl text-brand">{service.name}</h1>
          </div>
          <div className="rounded-2xl bg-brand-soft px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Precio</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{service.priceDisplay ?? 'Consultar'}</p>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-body">{service.description}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-background p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Duración</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{formatDuration(service.estimatedDuration ?? 60)}</p>
          </div>
          <div className="rounded-2xl bg-background p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Estado</p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {service.isActive && service.isBookable ? 'Disponible' : 'No disponible'}
            </p>
          </div>
          <div className="rounded-2xl bg-background p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reservas</p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {service.isBookable ? 'Abiertas' : 'Cerradas'}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/public/appointments?serviceId=${service.id}`}
            className="rounded-xl bg-strong px-5 py-3 text-sm font-medium text-strong-fg"
          >
            Agendar este servicio
          </Link>
          <Link
            href="/public/services"
            className="rounded-xl border border-line bg-surface-soft px-5 py-3 text-sm font-medium text-foreground"
          >
            Ver más servicios
          </Link>
        </div>
      </div>
    </main>
  );
}
