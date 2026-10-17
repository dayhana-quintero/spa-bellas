'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ThemeToggle } from '@/shared/theme/theme-toggle';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (searchParams.get('reason') === 'expired') {
        await fetch('/api/admin/session', { method: 'DELETE' });
      }

      const response = await fetch('/api/admin/session');
      const data = (await response.json().catch(() => ({ authenticated: false }))) as { authenticated?: boolean };

      if (!cancelled && data.authenticated) {
        router.replace('/admin');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode }),
      });

      const data = (await response.json().catch(() => ({ ok: false }))) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? 'Código de acceso inválido.');
      }

      router.push('/admin');
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <ThemeToggle className="absolute right-6 top-6 h-9 w-9 rounded-full border border-line bg-surface text-foreground shadow-sm hover:bg-surface-hover" />
      <div className="w-full max-w-md rounded-[28px] bg-surface-warm p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Administración</p>
        <h1 className="mt-2 font-serif text-4xl text-brand">Acceso privado</h1>
        <p className="mt-3 text-sm text-body">Ingresa el código de acceso para entrar al panel del spa.</p>

        {searchParams.get('reason') === 'expired' ? (
          <p className="mt-3 rounded-xl border border-line bg-surface-soft px-3 py-2 text-sm text-amber-text">
            Tu sesión expiró. Por favor, inicia sesión nuevamente.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-body">
            Código de acceso
            <input
              type="password"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand"
              autoComplete="current-password"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-line bg-brand-soft px-3 py-2 text-sm text-danger">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || accessCode.trim().length === 0}
            className="w-full rounded-xl bg-strong px-4 py-3 font-semibold text-strong-fg transition hover:bg-strong-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Validando...' : 'Entrar al panel'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-body">
          ¿No tienes acceso?{' '}
          <Link href="/" className="font-semibold text-brand underline-offset-4 hover:underline">
            Volver al sitio público
          </Link>
        </div>
      </div>
    </main>
  );
}
