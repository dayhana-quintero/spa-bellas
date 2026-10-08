'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Panel administrativo:', error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center overflow-auto p-6">
      <div
        role="alert"
        className="w-full max-w-lg rounded-[28px] border border-[#f0d9d3] bg-[#faf6f3] p-8 shadow-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d6966]">
          Panel administrativo
        </p>
        <h1 className="mt-2 font-serif text-4xl text-[#d56572]">No pudimos cargar el panel</h1>
        <p className="mt-4 text-base leading-6 text-[#544a48]">
          Ocurrió un problema al consultar los datos del spa. Puede ser una falla temporal de la
          base de datos. Vuelve a intentar o regresa al inicio del panel.
        </p>

        {error.digest ? (
          <p className="mt-3 text-xs text-[#8b7f7c]">Referencia: {error.digest}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex rounded-xl bg-[#1f1f21] px-4 py-3 font-semibold text-white transition hover:bg-[#2a2a2d]"
          >
            Volver a intentar
          </button>
          <Link
            href="/admin"
            className="inline-flex rounded-xl border border-[#d9c8c3] bg-white px-4 py-3 font-semibold text-[#2b2b2b] transition hover:bg-[#f7f2ef]"
          >
            Ir al inicio del panel
          </Link>
        </div>
      </div>
    </main>
  );
}
