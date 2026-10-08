const KPI_SKELETONS = [1, 2, 3, 4, 5];

export default function AdminLoading() {
  return (
    <main className="flex-1 overflow-auto px-8 py-7" aria-busy="true">
      <p role="status" className="sr-only">
        Cargando el panel administrativo…
      </p>

      <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d6966]">
        Bellas · Panel del spa
      </div>

      <div className="mb-8">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-[#e8dcd7]" />
        <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-[#ece2dd]" />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {KPI_SKELETONS.map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-[#e8d8d1] bg-white p-4 shadow-sm"
          >
            <div className="h-3 w-20 rounded bg-[#eee2dd]" />
            <div className="mt-4 h-11 w-16 rounded bg-[#e8dcd7]" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-[22px] border border-[#e6d7d2] bg-[#f7f3f1]" />
        <div className="h-72 animate-pulse rounded-[22px] border border-[#e6d7d2] bg-[#f7f3f1]" />
      </div>
    </main>
  );
}
