import Image from 'next/image';
import Link from 'next/link';

import { getPublicCatalog } from '@/domain/services/public-catalog';
import { formatDuration } from '@/shared/format-duration';
import { serviceImageSrc } from '@/shared/services/service-images';

const thumbnailGradients = [
  'linear-gradient(140deg,#FBE6EB,#F4C6D0)',
  'linear-gradient(140deg,#FBF5EE,#F5EBDD)',
  'linear-gradient(140deg,#F4C6D0,#FBF5EE)',
  'linear-gradient(140deg,#F5EBDD,#FBE6EB)',
];

function ServiceGlyph({ index }: { index: number }) {
  const variant = index % 4;
  const common = {
    width: 40,
    height: 40,
    viewBox: '0 0 80 80',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (variant === 0) {
    return (
      <svg {...common}>
        <path d="M18 47c12-24 38-32 46-32 0 18-10 40-46 48-3-6-2-11 0-16Z" />
        <path d="M18 47c12-7 26-14 46-18" />
      </svg>
    );
  }

  if (variant === 1) {
    return (
      <svg {...common}>
        <path d="M40 12v56M18 40h44M24 24l32 32M56 24L24 56" />
      </svg>
    );
  }

  if (variant === 2) {
    return (
      <svg {...common}>
        <path d="M12 44c8-12 16-18 24-18 8 0 15 6 24 18s16 18 24 18" />
        <path d="M12 54c8-12 16-18 24-18 8 0 15 6 24 18s16 18 24 18" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M26 58c0-15 11-27 27-27 6 0 14 2 20 8" />
      <path d="M24 54c0-11 8-20 20-20 6 0 14 3 19 9" />
      <path d="M22 38c8 0 16-5 21-12" />
    </svg>
  );
}

export default async function PublicServicesPage() {
  const services = await getPublicCatalog();

  return (
    <main className="min-h-screen flex-1 bg-background text-foreground">
      <div className="mx-auto max-w-[1120px] px-5 py-10 sm:px-6">
        <Link
          href="/public"
          className="logo-silver inline-block text-2xl font-semibold tracking-[0.2em]"
        >
          BELLAS
        </Link>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Bellas Spa
        </p>
        <h1 className="mt-3 font-display text-[clamp(40px,6vw,56px)] font-semibold leading-none text-cherry">
          Servicios disponibles
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-body">
          Explora los tratamientos disponibles y elige el que mejor se adapte a tus necesidades.
        </p>

        {services.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-surface/50 p-8 text-center text-body">
            No hay servicios disponibles en este momento.
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {services.map((service, index) => {
              const imageSrc = serviceImageSrc(service.name);

              return (
                <article
                  key={service.id}
                  className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-[18px] border border-line bg-surface p-4 shadow-sm sm:grid-cols-[172px_minmax(0,1fr)] sm:gap-5"
                >
                  {imageSrc ? (
                    <div className="relative min-h-[150px] overflow-hidden rounded-[56px_56px_12px_12px] sm:min-h-[190px] sm:rounded-[70px_70px_14px_14px]">
                      <Image
                        src={imageSrc}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 172px, 96px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="grid min-h-[150px] place-items-center rounded-[56px_56px_12px_12px] text-cherry sm:min-h-[190px] sm:rounded-[70px_70px_14px_14px]"
                      style={{ background: thumbnailGradients[index % thumbnailGradients.length] }}
                    >
                      <ServiceGlyph index={index} />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 p-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {service.category}
                    </p>
                    <h2 className="text-[18px] font-bold leading-snug">{service.name}</h2>
                    <p className="flex-1 text-sm leading-6 text-body">{service.description}</p>

                    <div className="my-1 flex items-baseline gap-2.5">
                      <b className="font-display text-[30px] font-semibold leading-none">
                        {service.priceDisplay ?? 'Consultar'}
                      </b>
                      <span className="text-[13px] text-muted-foreground">
                        {formatDuration(service.estimatedDuration ?? 60)}
                      </span>
                    </div>

                    <div className="mt-1 flex gap-2">
                      <Link
                        href={`/public/services/${service.id}`}
                        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-foreground transition hover:border-pink-deep hover:bg-pink-soft"
                      >
                        Ver detalles
                      </Link>
                      <Link
                        href={`/public/appointments?serviceId=${service.id}`}
                        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-pink px-4 text-sm font-semibold text-on-pink transition hover:bg-pink-deep"
                      >
                        Agendar
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
