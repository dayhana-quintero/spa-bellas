import { capitalize } from './format';

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  pendiente: { pill: 'bg-st-pend text-st-pend-ink', dot: 'bg-st-pend-dot' },
  confirmada: { pill: 'bg-st-conf text-st-conf-ink', dot: 'bg-st-conf-dot' },
  reprogramada: { pill: 'bg-st-reprog text-st-reprog-ink', dot: 'bg-st-reprog-dot' },
  cancelada: { pill: 'bg-st-cancel text-st-cancel-ink', dot: 'bg-st-cancel-dot' },
};

const NEUTRAL_STYLE = {
  pill: 'bg-st-neutral text-st-neutral-ink',
  dot: 'bg-st-neutral-dot',
};

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
