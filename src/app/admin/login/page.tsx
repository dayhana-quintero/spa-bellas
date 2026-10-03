'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const response = await fetch('/api/admin/session');
      const data = (await response.json().catch(() => ({ authenticated: false }))) as { authenticated?: boolean };

      if (!cancelled && data.authenticated) {
        router.replace('/admin');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

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
    <main className="flex min-h-screen items-center justify-center bg-[#f6f1ee] p-6 text-[#2b2b2b]">
      <div className="w-full max-w-md rounded-[28px] bg-[#faf6f3] p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d6966]">Administración</p>
        <h1 className="mt-2 font-serif text-4xl text-[#d56572]">Acceso privado</h1>
        <p className="mt-3 text-sm text-[#544a48]">Ingresa el código de acceso para entrar al panel del spa.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-[#433d3b]">
            Código de acceso
            <input
              type="password"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-[#d9c8c3] bg-white px-3 py-3 text-base outline-none transition focus:border-[#d56572] focus:ring-2 focus:ring-[#f3d7d7]"
              autoComplete="current-password"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-[#f0c0c8] bg-[#fff2f4] px-3 py-2 text-sm text-[#8a5757]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || accessCode.trim().length === 0}
            className="w-full rounded-xl bg-[#1f1f21] px-4 py-3 font-semibold text-white transition hover:bg-[#2a2a2d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Validando...' : 'Entrar al panel'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#544a48]">
          ¿No tienes acceso?{' '}
          <Link href="/" className="font-semibold text-[#d56572] underline-offset-4 hover:underline">
            Volver al sitio público
          </Link>
        </div>
      </div>
    </main>
  );
}
