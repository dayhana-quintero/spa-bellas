'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Cerrar sesión"
      className="rounded-xl border border-white/20 px-1 py-1.5 text-[10px] font-semibold text-sidebar-text transition hover:bg-sidebar-accent md:border-line md:bg-surface md:px-3 md:py-2 md:text-sm md:text-foreground"
    >
      <span className="md:hidden">Salir</span>
      <span className="hidden md:inline">Cerrar sesión</span>
    </button>
  );
}
