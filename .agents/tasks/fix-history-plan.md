# Implementation Plan — Corregir historial de citas

## Contexto

El historial de citas usa dos fuentes incorrectas:
- `appointment-history-repository.ts` llama a `findAllAppointments()` del repositorio en memoria (20 citas hardcodeadas con IDs ficticios).
- `appointment-history-service.ts::getAppointmentDetail` llama a `findAppointmentById` del mismo repositorio en memoria.
- `history/page.tsx` es un Client Component que además usa arrays hardcodeados (`clientNames[]`, `serviceNames[]`) para mostrar nombres falsos.
- `history/[appointmentId]/page.tsx` ya es Server Component y ya importa `readSpaData`, pero muestra `Cliente #<id>` y `Servicio #<id>` en lugar de los nombres reales.

La fuente correcta es `readSpaData()` de `@/storage/spa-store`, que lee `data/spa-data.json` en el servidor y `localStorage` en el cliente.

---

- [ ] 1. **Cambiar la fuente de datos en `appointment-history-repository.ts`**

  Reemplazar el import de `findAllAppointments` por `readSpaData` y sustituir la llamada dentro de `findAppointmentHistory`.

  ```ts
  // Antes
  import { findAllAppointments } from './in-memory-appointment-repository';
  // ...
  const allAppointments = findAllAppointments();

  // Después
  import { readSpaData } from '@/storage/spa-store';
  // ...
  const allAppointments = readSpaData().appointments;
  ```

  NO tocar el resto de la lógica de filtros/paginación — sigue siendo correcta.

  **Archivos:** `src/storage/appointments/appointment-history-repository.ts`

  **Verificar:** `npx tsc --noEmit` — sin errores nuevos en este archivo.

---

- [ ] 2. **Cambiar la fuente de datos en `appointment-history-service.ts::getAppointmentDetail`**

  Reemplazar `findAppointmentById(id)` por una búsqueda directa en `readSpaData().appointments`.

  ```ts
  // Antes
  import { findAppointmentById } from '@/storage/appointments/in-memory-appointment-repository';
  // ...
  export function getAppointmentDetail(id: string): Appointment | undefined {
    return findAppointmentById(id);
  }

  // Después
  import { readSpaData } from '@/storage/spa-store';
  // (quitar el import de findAppointmentById si ya no se usa en el archivo)
  // ...
  export function getAppointmentDetail(id: string): Appointment | undefined {
    return readSpaData().appointments.find((a) => a.id === id);
  }
  ```

  El import de `findHistory` y el resto de `getAppointmentHistory` no cambian.

  **Archivos:** `src/domain/appointments/appointment-history-service.ts`

  **Verificar:** `npx tsc --noEmit` — sin errores nuevos en este archivo.

---

- [ ] 3. **Convertir `history/page.tsx` de Client Component a Server Component**

  Este es el cambio más amplio. La página actualmente usa `"use client"`, `useState`, `useMemo`, y arrays falsos de nombres. Hay que reescribirla como un async Server Component que:

  - Recibe filtros mediante `searchParams: Promise<{ status?: string; from?: string; to?: string; page?: string }>`.
  - Llama a `getAppointmentHistory(query)` (ya existe en el servicio, funciona en servidor).
  - Resuelve `clientName` y `serviceName` desde `readSpaData()` para cada cita.
  - Renderiza paginación con `<Link>` reales de Next.js (no con botones + `onClick`), igual que `admin/page.tsx` hace con sus filtros de estado.
  - Quita la columna "Profesional" (o muestra "—") porque el tipo `Appointment` no tiene ese campo.
  - Quita la columna "Profesional" del `<TableHeader>` y de cada `<TableRow>`, o la rellena con el literal `"—"` en todas las filas.

  ### Estructura del nuevo componente

  ```tsx
  // SIN "use client"
  import Link from 'next/link';
  import { getAppointmentHistory } from '@/domain/appointments/appointment-history-service';
  import { readSpaData } from '@/storage/spa-store';
  // shadcn Table, etc. — mismos imports que antes

  export default async function HistoryPage({
    searchParams,
  }: {
    searchParams: Promise<{ status?: string; from?: string; to?: string; page?: string }>;
  }) {
    const params = await searchParams;

    const status = params.status ?? '';
    const dateFrom = params.from ?? '';
    const dateTo = params.to ?? '';
    const page = Number(params.page ?? '1') || 1;

    const result = getAppointmentHistory({
      status: (status || undefined) as Appointment['status'] | undefined,
      from: dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined,
      to: dateTo ? new Date(`${dateTo}T23:59:59`) : undefined,
      page,
      pageSize: 10,
    });

    const spaData = readSpaData();

    const rows = result.items.map((item) => ({
      ...item,
      clientName:
        spaData.clients.find((c) => c.id === item.clientId)?.name ?? 'Cliente sin nombre',
      serviceName:
        spaData.services.find((s) => s.id === item.serviceId)?.name ?? 'Servicio sin nombre',
    }));
    // ...
  }
  ```

  ### Filtros: convertir `<form>` con `<select>` e `<input type="date">`

  El formulario de filtros pasa a ser un `<form method="get">` nativo (igual que en `admin/page.tsx`), con los campos `name="status"`, `name="from"`, `name="to"`. El botón "Limpiar filtros" se convierte en un `<Link href="/admin/appointments/history">`.

  ```tsx
  <form action="/admin/appointments/history" method="get">
    <input type="date" name="from" defaultValue={dateFrom} ... />
    <input type="date" name="to" defaultValue={dateTo} ... />
    <select name="status" defaultValue={status}>...</select>
    <button type="submit">Filtrar</button>
  </form>
  <Link href="/admin/appointments/history">Limpiar filtros</Link>
  ```

  ### Paginación con Links reales

  ```tsx
  // Construir los params preservando filtros activos
  function buildPageUrl(p: number, status: string, from: string, to: string): string {
    const sp = new URLSearchParams();
    if (status) sp.set('status', status);
    if (from) sp.set('from', from);
    if (to) sp.set('to', to);
    sp.set('page', String(p));
    return `/admin/appointments/history?${sp.toString()}`;
  }

  {result.totalPages > 1 && (
    <div className="mt-4 flex items-center justify-end gap-2">
      {page > 1 ? (
        <Link href={buildPageUrl(page - 1, status, dateFrom, dateTo)}
          className="rounded-lg border ... text-[#3c3332]">
          Anterior
        </Link>
      ) : (
        <span className="... opacity-50">Anterior</span>
      )}
      <span className="text-sm text-[#4a423f]">
        Página {result.page} de {result.totalPages}
      </span>
      {page < result.totalPages ? (
        <Link href={buildPageUrl(page + 1, status, dateFrom, dateTo)}
          className="rounded-lg border ... text-[#3c3332]">
          Siguiente
        </Link>
      ) : (
        <span className="... opacity-50">Siguiente</span>
      )}
    </div>
  )}
  ```

  ### Sidebar activo

  El sidebar usa `usePathname()` para marcar el ítem activo, lo cual requiere `"use client"`. Al convertir a Server Component, cambiar esa lógica: el enlace de "Historial de citas" siempre tendrá el estilo activo en esta página (hardcodeado con las clases `bg-[#e8dbd7] text-[#1f1d1d]`). No hace falta `usePathname`.

  ### Columna "Profesional"

  El tipo `Appointment` no tiene campo `professional`. Hay dos opciones aceptables; se elige la más simple: mantener la columna en la tabla y mostrar `"—"` en todas las filas, así la estructura visual no cambia.

  ```tsx
  <TableHead ...>Profesional</TableHead>
  // en cada fila:
  <TableCell ...>—</TableCell>
  ```

  **Archivos:** `src/app/admin/appointments/history/page.tsx`

  **Verificar:** `npx tsc --noEmit` — sin errores en este archivo. Luego abrir `/admin/appointments/history` en el navegador y confirmar que muestra citas de `data/spa-data.json`, que los filtros de estado/fecha funcionan recargando la URL, y que la paginación navega con links reales.

---

- [ ] 4. **Mejorar `history/[appointmentId]/page.tsx` para mostrar nombres reales**

  Este archivo ya es Server Component y ya llama a `readSpaData()`. Solo hay que usar esos datos para mostrar el nombre real del cliente y el servicio en lugar de `Cliente #<id>` y `Servicio #<id>`.

  ```tsx
  // Después del `const data = readSpaData();` que ya existe en el archivo:
  const clientName = data.clients.find((c) => c.id === appointment.clientId)?.name ?? 'Cliente sin nombre';
  const serviceName = data.services.find((s) => s.id === appointment.serviceId)?.name ?? 'Servicio sin nombre';
  ```

  Luego reemplazar en el JSX:

  ```tsx
  // Antes
  <p ...>Cliente #{appointment.clientId.slice(0, 8)}</p>
  <p ...>Servicio #{appointment.serviceId.slice(0, 8)}</p>

  // Después
  <p ...>{clientName}</p>
  <p ...>{serviceName}</p>
  ```

  **Archivos:** `src/app/admin/appointments/history/[appointmentId]/page.tsx`

  **Verificar:** `npx tsc --noEmit` — sin errores nuevos. Navegar a una cita en el historial y confirmar que se ven el nombre del cliente y del servicio correctamente.

---

- [ ] 5. **Verificación final de compilación**

  Con los cuatro cambios anteriores aplicados, correr:

  ```bash
  npx tsc --noEmit
  ```

  Debe pasar sin errores en los archivos modificados. Si hay errores preexistentes en otros archivos, ignorarlos (la restricción del task dice explícitamente no tocar errores de otros archivos).

  Luego intentar el build completo:

  ```bash
  npm run build
  ```

  El build debe completar sin errores nuevos relacionados con los archivos modificados.

  **Archivos:** ninguno adicional.

  **Verificar:** `npm run build` completa o falla solo en errores preexistentes en otros módulos no tocados.

---

## Notas de implementación

- `in-memory-appointment-repository.ts` **NO** se elimina — otros módulos lo usan (`hasConflictingAppointment`, `createAppointment`).
- El layout del sidebar en `history/page.tsx` se mantiene igual visualmente; solo se quita `usePathname` y se hardcodea el estilo activo del enlace de historial.
- Los componentes `Button`, `Input`, `Table`, etc. (shadcn) pueden seguir importándose en el Server Component — son componentes de presentación sin hooks de estado propio.
- `readSpaData()` se puede llamar múltiples veces en el mismo render de servidor sin problema (cada llamada lee el archivo; si en el futuro importa el rendimiento se puede hacer una sola llamada y pasarla).
