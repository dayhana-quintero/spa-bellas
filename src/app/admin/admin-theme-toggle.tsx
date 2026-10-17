'use client';

import { usePathname } from 'next/navigation';

import { ThemeToggle } from '@/shared/theme/theme-toggle';

const HIDDEN_ON = ['/admin/login', '/admin/access-denied'];

/**
 * Toggle de tema en la esquina superior derecha del panel, con el mismo
 * estilo circular que en la vista publica del spa.
 */
export function AdminThemeToggle() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <ThemeToggle className="absolute right-6 top-6 z-20 h-9 w-9 rounded-full border border-line-soft bg-surface text-foreground shadow-sm hover:bg-surface-hover" />
  );
}
