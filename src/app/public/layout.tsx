import type { Metadata } from 'next';
import { Cormorant_Garamond, Figtree } from 'next/font/google';

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bellas Spa | Reserva en línea',
  description:
    'Masajes, faciales y cuidado del cabello en un espacio tranquilo. Reserva en línea y te confirmamos por mensaje.',
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${displayFont.variable} ${bodyFont.variable} font-sans flex min-h-full flex-col`}>
      {children}
    </div>
  );
}
