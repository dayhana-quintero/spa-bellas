'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

interface ThemeToggleProps {
  /** Clases extra para adaptar el boton a su contexto (sidebar, cabecera, login). */
  className?: string;
  /** Muestra la etiqueta del tema junto al icono (para el sidebar). */
  withLabel?: boolean;
}

// Deteccion de montaje sin efectos: false en el servidor, true en el cliente.
const subscribe = () => () => {};
const useMounted = () => useSyncExternalStore(subscribe, () => true, () => false);

/**
 * Boton para alternar entre tema claro y oscuro.
 * El estado montado evita discrepar en la hidratacion del servidor.
 */
export function ThemeToggle({ className = '', withLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={isDark ? 'Tema claro' : 'Tema oscuro'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`inline-flex items-center justify-center gap-2 transition ${className}`}
    >
      {isDark ? (
        <Sun size={16} aria-hidden="true" />
      ) : (
        <Moon size={16} aria-hidden="true" />
      )}
      {withLabel ? <span>{isDark ? 'Tema claro' : 'Tema oscuro'}</span> : null}
    </button>
  );
}
