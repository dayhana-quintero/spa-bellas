"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { LogoutButton } from './logout-button';

interface AdminSidebarProps {
  pendingCount?: number;
}

function AdminSidebarInner({ pendingCount }: AdminSidebarProps) {
  const pathname = usePathname();

  // No renderizar sidebar en login/access-denied
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/access-denied')) {
    return null;
  }

  const isActive = (path: string): boolean => {
    const url = new URL(path, 'http://x');
    const targetPathname = url.pathname;

    if (targetPathname === '/admin') {
      return pathname === '/admin';
    }

    return pathname.startsWith(targetPathname);
  };

  const linkClass = (path: string) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium text-sidebar-text transition ${
      isActive(path)
        ? 'bg-sidebar-accent border-l-[3px] border-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
        : 'border-l-[3px] border-transparent opacity-80 hover:bg-sidebar-accent'
    }`;

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar px-4 py-5 text-sidebar-foreground">
      <div className="mb-6 px-2">
        <div className="font-serif text-[44px] font-bold leading-[0.72] tracking-[0.02em] text-sidebar-text">
          BELLAS
        </div>
        <div className="mt-1 text-[14px] text-sidebar-muted">Panel del spa</div>
      </div>

      <nav className="space-y-2">
        <Link href="/admin" className={linkClass('/admin')}>
          <span className="text-lg">📊</span>
          <span>Dashboard</span>
        </Link>

        <Link href="/admin/appointments/pending" className={linkClass('/admin/appointments/pending')}>
          <span className="text-lg">📅</span>
          <span>Citas pendientes</span>
          {pendingCount !== undefined && (
            <span className="ml-auto rounded-full bg-sidebar-badge px-2 text-[11px] font-bold text-on-pastel">
              {pendingCount}
            </span>
          )}
        </Link>

        <Link href="/admin/appointments/history" className={linkClass('/admin/appointments/history')}>
          <span className="text-lg">🧾</span>
          <span>Historial de citas</span>
        </Link>

        <Link href="/admin/inventory" className={linkClass('/admin/inventory')}>
          <span className="text-lg">🧴</span>
          <span>Insumos</span>
        </Link>

        <Link href="/admin/services" className={linkClass('/admin/services')}>
          <span className="text-lg">💆</span>
          <span>Servicios</span>
        </Link>
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4 flex flex-col gap-2">
        <LogoutButton />
      </div>
    </aside>
  );
}

export default function AdminSidebar({ pendingCount }: AdminSidebarProps) {
  return (
    <Suspense fallback={<aside className="flex w-64 shrink-0 bg-sidebar" />}>
      <AdminSidebarInner pendingCount={pendingCount} />
    </Suspense>
  );
}
