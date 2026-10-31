'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Refresca el render del servidor del panel (badge del sidebar, KPIs y
// listados) cada pocos segundos y al recuperar el foco de la pestana: asi
// una cita que llega desde el area publica aparece sola, sin recargar a
// mano y con ambos contadores siempre alineados.
export default function AdminAutoRefresh({ intervalMs = 30000 }: { intervalMs?: number } = {}) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => router.refresh();

    const timer = window.setInterval(refresh, intervalMs);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', refresh);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', refresh);
    };
  }, [router, intervalMs]);

  return null;
}
