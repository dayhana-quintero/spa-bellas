import Image from 'next/image';
import Link from 'next/link';

import InstallAppButton from '../install-app-button';
import { serviceImageSrc } from '@/shared/services/service-images';
import { getPublicCatalog } from '@/domain/services/public-catalog';
import { formatDuration } from '@/shared/format-duration';
import { ThemeToggle } from '@/shared/theme/theme-toggle';

const fallbackServices = [
  {
    id: '1',
    category: 'masajes',
    name: 'Masaje relajante',
    description: 'Sesión de 60 minutos con aceites tibios para soltar la tensión de espalda y cuello.',
    estimatedDuration: 60,
    priceDisplay: '$120.000',
  },
  {
    id: '2',
    category: 'faciales',
    name: 'Facial hidratante',
    description: 'Limpieza profunda, mascarilla y masaje facial para una piel luminosa.',
    estimatedDuration: 50,
    priceDisplay: '$95.000',
  },
  {
    id: '3',
    category: 'estética',
    name: 'Alisado orgánico',
    description: 'Tratamiento sin formol que suaviza el cabello y reduce el frizz por semanas.',
    estimatedDuration: 120,
    priceDisplay: '$180.000',
  },
  {
    id: '4',
    category: 'manos y pies',
    name: 'Manicure y pedicure spa',
    description: 'Cuidado completo de manos y pies con exfoliación e hidratación.',
    estimatedDuration: 75,
    priceDisplay: '$85.000',
  },
] as const;

const thumbnailGradients = [
  'linear-gradient(140deg,#FBE6EB,#F4C6D0)',
  'linear-gradient(140deg,#FBF5EE,#F5EBDD)',
  'linear-gradient(140deg,#F4C6D0,#FBF5EE)',
  'linear-gradient(140deg,#F5EBDD,#FBE6EB)',
];

function ServiceIcon({ variant, size = 40 }: { variant: 'leaf' | 'spark' | 'wave' | 'hand'; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 80 80',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (variant === 'leaf') {
    return (
      <svg {...common}>
        <path d="M18 47c12-24 38-32 46-32 0 18-10 40-46 48-3-6-2-11 0-16Z" />
        <path d="M18 47c12-7 26-14 46-18" />
        <path d="M34 32c6 7 12 13 20 17" />
      </svg>
    );
  }

  if (variant === 'spark') {
    return (
      <svg {...common}>
        <path d="M40 12v56M18 40h44M24 24l32 32M56 24L24 56" />
      </svg>
    );
  }

  if (variant === 'wave') {
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
      <path d="M26 58c6 4 13 7 21 7 15 0 27-10 27-24" />
    </svg>
  );
}

const iconVariants = ['leaf', 'spark', 'wave', 'hand'] as const;

export default async function PublicPage() {
  const services = await getPublicCatalog();
  const displayServices = services.length > 0 ? services : fallbackServices;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-night/95 backdrop-blur">
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-5 py-3 sm:px-6"
        >
          <Link
            href="/public"
            className="logo-silver text-[28px] font-semibold tracking-[0.2em]"
          >
            BELLAS
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href="#servicios"
              className="hidden rounded-lg px-3 py-2 text-sm text-night-soft transition hover:text-pink sm:block"
            >
              Servicios
            </a>
            <Link
              href="#horarios"
              className="hidden rounded-lg px-3 py-2 text-sm text-night-soft transition hover:text-pink sm:block"
            >
              Horarios
            </Link>
            <Link
              href="/public/appointments"
              className="rounded-xl bg-pink px-4 py-2 text-sm font-semibold text-on-pink transition hover:bg-pink-deep"
            >
              Reservar
            </Link>
            <ThemeToggle className="ml-1 h-9 w-9 rounded-full border border-white/20 bg-transparent text-[#f4eef0] hover:bg-white/10" />
            <InstallAppButton />
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-night text-[#f4eef0]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_520px_at_82%_25%,rgba(244,198,208,0.24),transparent_62%)]"
        />
        <div className="relative mx-auto grid max-w-[1120px] items-center gap-12 px-5 py-14 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:py-20">
          <div>
            <h1 className="logo-silver text-[clamp(64px,12vw,132px)] font-semibold leading-none tracking-[0.14em]">
              BELLAS<span className="sr-only">, spa y centro de estética</span>
            </h1>
            <p className="mt-8 font-display text-[clamp(26px,3.4vw,38px)] font-medium leading-tight">
              Un momento solo para ti
            </p>
            <p className="mt-4 max-w-[44ch] text-base text-night-soft">
              Masajes, faciales y cuidado del cabello en un espacio tranquilo. Reserva en línea y
              te confirmamos por mensaje.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/public/appointments"
                className="rounded-xl bg-pink px-5 py-3 text-sm font-semibold text-on-pink transition hover:bg-pink-deep"
              >
                Reservar cita
              </Link>
              <a
                href="#servicios"
                className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-[#f4eef0] transition hover:border-pink hover:text-pink"
              >
                Ver servicios
              </a>
            </div>
          </div>

          <div className="relative mx-auto aspect-[3/4] w-full max-w-[340px]">
            <Image
              src="/images/hero-modelo.png"
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 340px, 90vw"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </section>

      <section id="servicios" className="mx-auto max-w-[1120px] scroll-mt-20 px-5 py-16 sm:px-6 md:py-24">
        <h2 className="font-display text-[clamp(32px,4.4vw,46px)] font-semibold leading-none text-cherry">
          Nuestros servicios
        </h2>
        <p className="mt-2 max-w-[56ch] text-lg text-body">
          Elige el tratamiento que quieres y reserva tu horario en línea.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {displayServices.map((service, index) => {
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
                    <ServiceIcon variant={iconVariants[index % iconVariants.length]} size={40} />
                  </div>
                )}

                <div className="flex flex-col gap-1.5 p-1.5">
                  <h3 className="text-[18px] font-bold leading-snug">{service.name}</h3>
                  <p className="flex-1 text-sm leading-6 text-body">{service.description}</p>

                  <div className="my-1 flex items-baseline gap-2.5">
                    <b className="font-display text-[30px] font-semibold leading-none">
                      {service.priceDisplay}
                    </b>
                    <span className="text-[13px] text-muted-foreground">
                      {formatDuration(service.estimatedDuration ?? 60)}
                    </span>
                  </div>

                  <Link
                    href={`/public/appointments?serviceId=${service.id}`}
                    className="mt-1 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-pink px-5 text-sm font-semibold text-on-pink transition hover:bg-pink-deep"
                  >
                    Solicitar cita
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="horarios" className="scroll-mt-20 border-t border-line bg-surface-soft">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-6 px-5 py-14 sm:px-6">
          <div>
            <h2 className="font-display text-[clamp(30px,4vw,42px)] font-semibold leading-none text-cherry">
              Reserva tu horario
            </h2>
            <p className="mt-2 max-w-[52ch] text-body">
              Elige servicio, día y hora en pocos pasos. Los horarios ocupados aparecen tachados.
            </p>
          </div>
          <Link
            href="/public/appointments"
            className="rounded-xl bg-pink px-6 py-3 text-sm font-semibold text-on-pink transition hover:bg-pink-deep"
          >
            Solicitar cita
          </Link>
        </div>
      </section>

      <footer className="bg-night text-night-soft">
        <div className="mx-auto max-w-[1120px] px-5 py-11 text-center sm:px-6">
          <span className="logo-silver inline-block text-[40px] font-semibold tracking-[0.2em]">
            BELLAS
          </span>
          <p className="mt-3 text-sm">Lunes a sábado · 9:00 AM a 8:00 PM</p>
        </div>
      </footer>
    </main>
  );
}
