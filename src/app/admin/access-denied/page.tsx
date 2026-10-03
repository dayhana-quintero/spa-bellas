import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f1ee] p-6 text-[#2b2b2b]">
      <div className="w-full max-w-lg rounded-[28px] bg-[#faf6f3] p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d6966]">Acceso</p>
        <h1 className="mt-2 font-serif text-4xl text-[#d56572]">Acceso denegado</h1>
        <p className="mt-4 text-base text-[#544a48]">
          Solo el administrador activo puede entrar al panel administrativo. La sesión actual no es válida o expiró.
        </p>

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
