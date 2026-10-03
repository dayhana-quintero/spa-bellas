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
      className="rounded-xl border border-[#d9c8c3] bg-white px-3 py-2 text-sm font-semibold text-[#2b2b2b] transition hover:bg-[#f7f2ef]"
    >
      Cerrar sesión
    </button>
  );
}
