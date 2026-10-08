import Link from 'next/link';

const DENIED_REASONS = new Set(['missing-session', 'expired-session', 'denied-role', 'invalid-user']);

const reasonMessages: Record<string, { title: string; message: string }> = {
  'missing-session': {
    title: 'Acceso denegado',
    message: 'No hay una sesión activa. Inicia sesión para acceder al panel administrativo.',
  },
  'expired-session': {
    title: 'Sesión expirada',
    message: 'Tu sesión ha expirado. Por razones de seguridad, vuelve a iniciar sesión para continuar.',
  },
  'denied-role': {
    title: 'Permisos insuficientes',
    message: 'Tu cuenta no tiene permisos de administrador para acceder al panel.',
  },
  'invalid-user': {
    title: 'Sesión inválida',
    message: 'La sesión actual no pudo ser verificada. Vuelve a iniciar sesión para obtener una sesión válida.',
  },
};

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason;
  const reasonKey = reason && DENIED_REASONS.has(reason) ? reason : 'missing-session';
  const { title, message } = reasonMessages[reasonKey];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f1ee] p-6 text-[#2b2b2b]">
      <div className="w-full max-w-lg rounded-[28px] bg-[#faf6f3] p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d6966]">Acceso</p>
        <h1 className="mt-2 font-serif text-4xl text-[#d56572]">{title}</h1>
        <p className="mt-4 text-base text-[#544a48]">{message}</p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/admin/login"
            className="inline-flex rounded-xl bg-[#1f1f21] px-4 py-3 font-semibold text-white transition hover:bg-[#2a2a2d]"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-xl border border-[#d9c8c3] bg-white px-4 py-3 font-semibold text-[#2b2b2b] transition hover:bg-[#f7f2ef]"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
