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
        className="w-full max-w-lg rounded-[28px] border border-line bg-surface-warm p-8 shadow-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Panel administrativo
        </p>
        <h1 className="mt-2 font-serif text-4xl text-brand">No pudimos cargar el panel</h1>
        <p className="mt-4 text-base leading-6 text-body">
          Ocurrió un problema al consultar los datos del spa. Puede ser una falla temporal de la
          base de datos. Vuelve a intentar o regresa al inicio del panel.
        </p>

        {error.digest ? (
          <p className="mt-3 text-xs text-muted-foreground">Referencia: {error.digest}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex rounded-xl bg-strong px-4 py-3 font-semibold text-strong-fg transition hover:bg-strong-hover"
          >
            Volver a intentar
          </button>
          <Link
            href="/admin"
            className="inline-flex rounded-xl border border-line bg-surface px-4 py-3 font-semibold text-foreground transition hover:bg-background"
          >
            Ir al inicio del panel
          </Link>
        </div>
      </div>
    </main>
  );
}
