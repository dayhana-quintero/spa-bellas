const KPI_SKELETONS = [1, 2, 3, 4, 5];

export default function AdminLoading() {
  return (
    <main className="flex-1 overflow-auto px-8 py-7" aria-busy="true">
      <p role="status" className="sr-only">
        Cargando el panel administrativo…
      </p>

      <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Bellas · Panel del spa
      </div>

      <div className="mb-8">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-surface-soft" />
        <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-surface-soft" />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {KPI_SKELETONS.map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-line bg-surface p-4 shadow-sm"
          >
            <div className="h-3 w-20 rounded bg-surface-soft" />
            <div className="mt-4 h-11 w-16 rounded bg-surface-soft" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-[22px] border border-line bg-surface-warm" />
        <div className="h-72 animate-pulse rounded-[22px] border border-line bg-surface-warm" />
      </div>
    </main>
  );
}
