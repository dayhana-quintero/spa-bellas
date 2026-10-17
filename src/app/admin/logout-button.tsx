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
      className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-background"
    >
      Cerrar sesión
    </button>
  );
}
