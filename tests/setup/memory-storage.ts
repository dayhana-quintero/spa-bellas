/**
 * Aisla el almacenamiento local de las pruebas.
 *
 * `spa-store` y `admin-users` persisten en `data/*.json` cuando no existe un
 * `window` global. Sin este setup, varias pruebas escriben el mismo archivo en
 * paralelo y se pisan (datos perdidos / carreras). Con un `window` en memoria
 * cada archivo de prueba trabaja sobre su propio almacenamiento y el repositorio
 * no se contamina.
 */
if (typeof globalThis.window === 'undefined') {
  const store = new Map<string, string>();

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
        clear: () => store.clear(),
        key: (index: number) => Array.from(store.keys())[index] ?? null,
        get length() {
          return store.size;
        },
      },
    },
  });
}

export {};
