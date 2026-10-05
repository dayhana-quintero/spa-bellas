"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LogoutButton } from './logout-button';

interface AdminSidebarProps {
  pendingCount?: number;
}

function AdminSidebarInner({ pendingCount }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // No renderizar sidebar en login/access-denied
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/access-denied')) {
    return null;
  }

  const isActive = (path: string): boolean => {
    const url = new URL(path, 'http://x');
    const targetPathname = url.pathname;
    const targetStatus = url.searchParams.get('status');

    if (targetPathname === '/admin') {
      if (targetStatus === null) {
        // /admin sin status: activo si pathname === '/admin' y no hay status o es 'pendiente'
        return pathname === '/admin' && (searchParams.get('status') === null || searchParams.get('status') === 'pendiente');
      }
      // /admin?status=xxx
      return pathname === '/admin' && searchParams.get('status') === targetStatus;
    }

    return pathname.startsWith(targetPathname);
  };

  const linkClass = (path: string) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium text-[#f5f0ef] transition ${
      isActive(path)
        ? 'bg-[#2b2b2f] border-l-[3px] border-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
        : 'border-l-[3px] border-transparent opacity-80 hover:bg-[#2b2b2f]'
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
          {pendingCount !== undefined && (
            <span className="ml-auto rounded-full bg-[#f5d9d5] px-2 text-[11px] font-bold text-[#1d1a1a]">
              {pendingCount}
            </span>
          )}
        </Link>

        <Link href="/admin?status=cancelada" className={linkClass('/admin?status=cancelada')}>
          <span className="text-lg">✕</span>
          <span>Citas canceladas</span>
        </Link>

        <Link href="/admin/inventory" className={linkClass('/admin/inventory')}>
          <span className="text-lg">🧴</span>
          <span>Insumos</span>
        </Link>

        <Link href="/admin/services" className={linkClass('/admin/services')}>
          <span className="text-lg">💆</span>
          <span>Servicios</span>
        </Link>

        <Link href="/admin/appointments/history" className={linkClass('/admin/appointments/history')}>
          <span className="text-lg">🧾</span>
          <span>Historial de citas</span>
        </Link>
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4 flex flex-col gap-2">
        <LogoutButton />
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

export default function AdminSidebar({ pendingCount }: AdminSidebarProps) {
  return (
    <Suspense fallback={<aside className="flex w-64 shrink-0 bg-[#17171a]" />}>
      <AdminSidebarInner pendingCount={pendingCount} />
    </Suspense>
  );
}
