"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LogoutButton } from './logout-button';

interface AdminSidebarProps {
  pendingCount?: number;
}

function AdminSidebarInner({ pendingCount }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      <button
        type="button"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-foreground shadow-sm md:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {isOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 md:hidden"
        />
      ) : null}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] shrink-0 flex-col bg-sidebar px-4 py-5 text-sidebar-foreground shadow-2xl transition-transform duration-200 md:static md:w-64 md:translate-x-0 md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="mb-6 flex items-start justify-between px-2">
        <div>
          <div className="font-serif text-[44px] font-bold leading-[0.72] tracking-[0.02em] text-sidebar-text">
            BELLAS
          </div>
          <div className="mt-1 text-[14px] text-sidebar-muted">Panel del spa</div>
        </div>
        <button type="button" aria-label="Cerrar menú" onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-sidebar-text hover:bg-sidebar-accent md:hidden">
          <X size={20} />
        </button>
      </div>

      <nav className="space-y-2">
        <Link href="/admin" onClick={() => setIsOpen(false)} className={linkClass('/admin')}>
          <span className="text-lg">📊</span>
          <span>Dashboard</span>
        </Link>

        <Link href="/admin/appointments/pending" onClick={() => setIsOpen(false)} className={linkClass('/admin/appointments/pending')}>
          <span className="text-lg">📅</span>
          <span>Citas pendientes</span>
          {pendingCount !== undefined && (
            <span className="ml-auto rounded-full bg-sidebar-badge px-2 text-[11px] font-bold text-on-pastel">
              {pendingCount}
            </span>
          )}
        </Link>

        <Link href="/admin/appointments/history" onClick={() => setIsOpen(false)} className={linkClass('/admin/appointments/history')}>
          <span className="text-lg">🧾</span>
          <span>Historial de citas</span>
        </Link>

        <Link href="/admin/inventory" onClick={() => setIsOpen(false)} className={linkClass('/admin/inventory')}>
          <span className="text-lg">🧴</span>
          <span>Insumos</span>
        </Link>

        <Link href="/admin/services" onClick={() => setIsOpen(false)} className={linkClass('/admin/services')}>
          <span className="text-lg">💆</span>
          <span>Servicios</span>
        </Link>
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4">
        <LogoutButton />
      </div>
      </aside>
    </>
  );
}

export default function AdminSidebar({ pendingCount }: AdminSidebarProps) {
  return (
    <Suspense fallback={<aside className="hidden w-64 shrink-0 bg-sidebar md:block" />}>
      <AdminSidebarInner pendingCount={pendingCount} />
    </Suspense>
  );
}
