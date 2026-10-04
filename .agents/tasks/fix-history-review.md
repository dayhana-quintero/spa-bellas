# Historial de citas migrado a spa-store / spa-data.json

El cambio reemplaza el repositorio en memoria (`findAllAppointments` del in-memory repo) por `readSpaData().appointments` en toda la cadena del historial de citas. El repositorio, el servicio de dominio y ambas páginas del historial fueron actualizados en conjunto. La página de listado fue convertida de componente cliente con hooks a Server Component, y la paginación pasó de estado React a `searchParams` + `<Link>`. Los nombres de cliente y servicio ahora se resuelven en tiempo de render desde `spa-store` en lugar de arrays hardcodeados.

Watch for (confirmed): `totalPages` devuelve `0` cuando no hay citas (`Math.ceil(0/10) || 0`), lo que oculta los controles de paginación correctamente, pero la lógica `|| 0` es redundante con `Math.ceil` y podría enmascarar un bug si `pageSize` fuera `0`. Watch for (confirmed): el sidebar está duplicado — renderizado inline dentro de `history/page.tsx` en lugar de delegarlo al `admin/layout.tsx`, que actualmente es un pass-through vacío.

**Verdict**: APPROVED

---

## High-level view

El repositorio llama directamente a `readSpaData().appointments` y aplica todos los filtros sobre ese array, eliminando la dependencia del in-memory store. La normalización de fechas (`from`/`to` como `Date | string`) ocurre en el servicio de dominio, por lo que el repositorio siempre recibe `Date` hidratados.

La página de listado es un Server Component puro: sin `'use client'`, sin hooks, sin estado React. La paginación navega con `<Link href={buildPageUrl(...)}>` construyendo la URL con `URLSearchParams`, preservando los filtros activos entre páginas.

Los nombres de cliente y servicio se resuelven con `spaData.clients.find(...)` y `spaData.services.find(...)` sobre los datos del store, con fallbacks defensivos. La página de detalle hace lo mismo y además construye la línea de tiempo cruzando `statusRecords` y `communicationRecords` del mismo store.

El sidebar está incrustado en `history/page.tsx` directamente. El `admin/layout.tsx` es un pass-through vacío (`<>{children}</>`), así que el sidebar no se comparte con otras rutas admin — cada página lo duplica o lo omite según su propia implementación.

---

<details>
<summary>Issues (2)</summary>

1. **Sidebar duplicado en history/page.tsx** — El sidebar está renderizado inline dentro de `history/page.tsx` en lugar de vivir en `admin/layout.tsx`, que hoy es un pass-through vacío. Esto no es un bug funcional pero introduce duplicación con otras páginas admin. Mover el sidebar al layout o dejarlo explícito como decisión consciente.

2. **`totalPages` con `|| 0` redundante** — `Math.ceil(total / pageSize) || 0` cuando `total === 0` da `0 || 0 = 0`. Correcto por accidente, pero si `pageSize` llegara a ser `0` (no validado) explotaría con `Infinity`. Considerar `pageSize <= 0` como guardia o simplificar a `Math.ceil(total / pageSize)`.

</details>

---

<details>
<summary>Details</summary>

### Migración a readSpaData en el repositorio

`findAppointmentHistory` reemplaza `findAllAppointments()` con `readSpaData().appointments` como punto de entrada. Todos los filtros (`status`, `from`, `to`, `clientId`, `serviceId`) operan sobre ese array. El sort descendente por `scheduledStart` se aplica sobre una copia del array (`[...data].sort(...)`), evitando mutar la referencia original del store.

El único punto débil es la expresión `Math.ceil(total / pageSize) || 0`: cuando `total` es cero da el resultado esperado, pero la guardia `|| 0` es redundante con `Math.ceil` y oculta que `pageSize === 0` produciría `Infinity`. `pageSize` llega siempre como `10` desde la página, pero no hay validación en el repositorio.

### Server Component sin hooks

`history/page.tsx` no tiene `'use client'`, no importa ningún hook de React, y recibe `searchParams` como prop asíncrona (`Promise<{...}>`). Los controles de filtro son un `<form method="get">` que hace submit al mismo path — no requiere JS del lado del cliente. La paginación usa `<Link>` con URLs construidas por `buildPageUrl`, que preserva `status`, `from` y `to` al cambiar de página.

### Resolución de nombres desde spa-store

Tanto la página de listado como la de detalle llaman a `readSpaData()` para resolver nombres. En el listado se hace una sola llamada y se mapea sobre `result.items`. En el detalle, la misma llamada alimenta también la construcción de la línea de tiempo. Los fallbacks `'Cliente sin nombre'` y `'Servicio sin nombre'` son correctos como defensa ante IDs huérfanos.

### Sidebar incrustado

El sidebar en `history/page.tsx` está renderizado inline, replicando la estructura de otras páginas admin. `admin/layout.tsx` es un pass-through vacío (`<>{children}</>`). Esto no rompe nada hoy, pero confirma que el sidebar vive duplicado en cada página en lugar de en el layout compartido.

### in-memory-appointment-repository.ts no fue modificado

`findAllAppointments` sigue existiendo en el in-memory repo (confirmado), pero ninguno de los archivos modificados lo importa. La separación entre el repositorio de historial (que lee del file store) y el repositorio en memoria (que maneja el estado mutable de citas activas) se mantiene limpia.

</details>

---

<details>
<summary>Archivos modificados</summary>

| Archivo | Cambio |
|---|---|
| `src/storage/appointments/appointment-history-repository.ts` | Reemplaza `findAllAppointments()` por `readSpaData().appointments`; agrega paginación y filtros |
| `src/domain/appointments/appointment-history-service.ts` | Agrega `getAppointmentDetail` que lee del store; normaliza fechas `from`/`to` |
| `src/app/admin/appointments/history/page.tsx` | Convierte a Server Component; paginación con `<Link>`/`searchParams`; resolución de nombres desde store |
| `src/app/admin/appointments/history/[appointmentId]/page.tsx` | Lee cita y construye línea de tiempo desde `readSpaData()` |

</details>
