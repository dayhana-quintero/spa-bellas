export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <nav aria-label="Navegación principal" className="border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="text-lg font-semibold">Spa Atelier</div>
          <div className="flex items-center gap-4 text-sm">
            <a href="#services" className="hover:underline">Servicios</a>
            <a href="#booking" className="hover:underline">Agenda</a>
            <a href="#contact" className="hover:underline">Contacto</a>
          </div>
        </div>
      </nav>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-600">
          Bienestar y calma
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Cuidado de spa pensado para tu bienestar
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
          Disfruta tratamientos relajantes, rituales de belleza y horarios pensados para
          tu descanso.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#services"
            className="rounded-full bg-rose-600 px-5 py-3 font-medium text-white transition hover:bg-rose-500"
          >
            Ver servicios
          </a>
          <a
            href="#booking"
            className="rounded-full border border-zinc-300 bg-white px-5 py-3 font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            Agendar cita
          </a>
        </div>
      </section>
    </main>
  );
}
