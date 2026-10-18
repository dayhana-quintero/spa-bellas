const CACHE_NAME = 'bellas-spa-v2';

const STATIC_ASSETS = [
  '/',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );

  self.skipWaiting();
});

// Activa la version nueva y borra caches anteriores: asi desaparece el HTML
// cacheado de versiones previas del sitio (que podia seguir enlazando al admin).
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // El area administrativa y las APIs nunca se sirven ni se guardan en cache:
  // la proteccion de rutas y los 401 deben aplicar en cada peticion.
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api'))
  ) {
    return;
  }

  // Navegaciones: red primero (el HTML siempre viene fresco del servidor);
  // la cache solo responde si no hay conexion y se actualiza con cada visita.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && !response.redirected) {
            const copy = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached ?? caches.match('/')),
        ),
    );
    return;
  }

  // Estaticos (iconos): cache primero para carga rapida, red como respaldo.
  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request)),
  );
});
