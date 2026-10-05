import Link from 'next/link';

import { getPublicCatalog } from '@/domain/services/public-catalog';
import { formatDuration } from '@/shared/format-duration';

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

const cardStyles = ['bg-[#f6dfe4]', 'bg-[#f2ebdf]', 'bg-[#f4dfe6]', 'bg-[#f3e8e4]'];

function ServiceIcon({ variant }: { variant: 'leaf' | 'spark' | 'wave' | 'hand' }) {
  const common = {
    width: 58,
    height: 58,
    viewBox: '0 0 80 80',
    fill: 'none',
    stroke: '#a85d6c',
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
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


export default async function PublicPage() {
  const services = await getPublicCatalog();
  const displayServices = services.length > 0 ? services : fallbackServices;

  return (
    <main className="min-h-screen bg-[#f6f1ef] text-[#2b2b2b]">
      <header className="border-b border-[#e5d8d5] bg-[#f5f2f1]">
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.26em] text-[#332d2d]">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d7c8c4] bg-[#f8f3f1] text-[10px] text-[#af7b7d]">
              ✦
            </span>
            <span>BELLAS</span>
            <span className="text-[#b9a6a0]">•</span>
            <span className="normal-case tracking-[0.08em] text-[#6a5e5b]">Panel del spa</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0d2cf] bg-white text-[#2f2a2a] shadow-sm">
              ◔
            </button>
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0d2cf] bg-white text-[#2f2a2a] shadow-sm">
              ☾
            </button>
            <button type="button" className="rounded-full border border-[#e0d2cf] bg-white px-3 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[#2f2a2a] shadow-sm">
              Chat
            </button>
            <button type="button" className="rounded-full border border-[#e0d2cf] bg-[#f5eeec] px-3 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[#2f2a2a] shadow-sm">
              Exportar
            </button>
            <Link
              href="/admin"
              className="rounded-full bg-[#202021] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white shadow-sm"
            >
              Volver al panel
            </Link>
          </div>
        </nav>
      </header>

      <section className="flex min-h-[400px] items-center justify-center bg-[#141414] px-6 py-14 text-white">
        <div className="text-center">
          <h1 className="font-serif text-[4.5rem] leading-[0.9] tracking-[-0.09em] text-[#f0efed] sm:text-[6.5rem] md:text-[9rem]">
            BELLAS
          </h1>
          <p className="mt-4 text-xl font-light tracking-[0.02em] text-[#eee8e5] md:text-2xl">
            Un momento solo para ti.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-14 md:py-20">
        <div className="mb-8 flex flex-col gap-2">
          <h2 className="font-serif text-[3rem] leading-none text-[#7d3042] md:text-[4rem]">
            Nuestros servicios
          </h2>
          <p className="text-lg text-[#4a3f3d]">Elige el que prefieras y reserva tu horario.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {displayServices.map((service, index) => (
            <article
              key={service.id}
              className={`rounded-[24px] border border-[#e7d7d1] p-5 shadow-sm ${cardStyles[index % cardStyles.length]}`}
            >
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-[#dcb7bc] bg-[#f8f1f2]">
                <ServiceIcon variant={index === 0 ? 'leaf' : index === 1 ? 'spark' : index === 2 ? 'wave' : 'hand'} />
              </div>

              <h3 className="mt-6 text-[1.75rem] font-medium leading-tight text-[#2d2a2a]">
                {service.name}
              </h3>

              <p className="mt-3 text-[1.02rem] leading-7 text-[#4a4140]">
                {service.description}
              </p>

              <div className="mt-6 flex items-end justify-between gap-2 border-t border-[#d9c8c3] pt-4 text-[#383232]">
                <span className="text-[1.08rem] font-semibold">{service.priceDisplay}</span>
                <span className="text-[0.96rem] text-[#514947]">{formatDuration(service.estimatedDuration ?? 60)}</span>
              </div>

              <div className="mt-6 flex justify-center">
                <Link
                  href={`/public/appointments?serviceId=${service.id}`}
                  className="inline-flex rounded-full bg-[#e6b6c0] px-6 py-2.5 text-sm font-medium text-[#2e2929] transition hover:bg-[#e0a7b3]"
                >
                  Solicitar cita
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
