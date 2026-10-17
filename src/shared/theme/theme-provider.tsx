'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Proveedor de tema (claro/oscuro/sistema) de next-themes.
 * Debe envolver todo el arbol en el layout raiz; aplica la clase .dark en <html>.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
