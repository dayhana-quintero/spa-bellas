"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  // No renderizar sidebar en login/access-denied
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/access-denied')) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  const linkClass = (path: string) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium text-[#f5f0ef] ${
      isActive(path)
        ? 'bg-[#2b2b2f] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
        : 'opacity-80 hover:bg-[#2b2b2f]'
    }`;

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-[#17171a] px-4 py-5 text-[#f9f2f1]">
      <div className="mb-6 px-2">
        <div className="font-serif text-[44px] font-bold leading-[0.72] tracking-[0.02em] text-[#f5f0ef]">
          BELLAS
        </div>
        <div className="mt-1 text-[14px] text-[#d7d2d0]">Panel del spa</div>
      </div>

      <nav className="space-y-2">
        <Link href="/admin" className={linkClass('/admin')}>
          <span className="text-lg">📅</span>
          <span>Citas pendientes</span>
        </Link>

        <Link href="/admin?status=confirmada" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] text-[#ece4e1] opacity-80 hover:bg-[#2b2b2f]">
          <span className="text-lg">✓</span>
          <span>Citas confirmadas</span>
        </Link>

        <Link href="/admin?status=cancelada" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] text-[#ece4e1] opacity-80 hover:bg-[#2b2b2f]">
          <span className="text-lg">✕</span>
          <span>Citas canceladas</span>
        </Link>

        <Link href="/admin/inventory" className={linkClass('/admin/inventory')}>
          <span className="text-lg">🧴</span>
          <span>Insumos</span>
        </Link>

        <Link href="/admin/appointments/history" className={linkClass('/admin/appointments/history')}>
          <span className="text-lg">🧾</span>
          <span>Historial de citas</span>
        </Link>
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-3 text-[15px] font-medium text-[#f5f0ef] transition hover:bg-white/5"
        >
          <span>◐</span>
          <span>Ver como cliente</span>
        </Link>
      </div>
    </aside>
  );
}
