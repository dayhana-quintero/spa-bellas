import { capitalize } from './format';

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  pendiente: { pill: 'bg-[#f5eddc] text-[#7a6444]', dot: 'bg-[#b08d4f]' },
  confirmada: { pill: 'bg-[#e3f2e9] text-[#0a6b3d]', dot: 'bg-[#0a7d49]' },
  reprogramada: { pill: 'bg-[#f8e1e3] text-[#8a4955]', dot: 'bg-[#d56572]' },
  cancelada: { pill: 'bg-[#fbe4e2] text-[#b3261e]', dot: 'bg-[#b3261e]' },
};

const NEUTRAL_STYLE = { pill: 'bg-[#efece8] text-[#5a5350]', dot: 'bg-[#8a827e]' };

/** Etiqueta redondeada con punto de color para el estado de una cita. */
export function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? NEUTRAL_STYLE;

  return (
    <span
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {capitalize(status)}
    </span>
  );
}
