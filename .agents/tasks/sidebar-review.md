# Extracción del sidebar admin a componente compartido

El refactor mueve el `<aside>` de navegación que estaba duplicado en tres páginas del panel admin (`/admin`, `/admin/inventory`, `/admin/appointments/history`) a un componente `AdminSidebar` montado en `AdminLayout`. El objetivo es eliminar el re-render del sidebar al navegar entre secciones, centralizando el estado activo con `usePathname`.

Watch for: (1) **confirmed** — los enlaces de "Citas confirmadas" y "Citas canceladas" nunca reciben el estilo activo porque usan clases hardcodeadas en lugar de `linkClass()`; (2) **confirmed** — `getAppointmentHistory` lee de un archivo JSON local (`readSpaData`), no de una base de datos real — los datos del historial son estáticos; (3) **confirmed** — el layout no excluye `/admin/login` ni `/admin/access-denied` del wrapper `flex h-screen`, solo el sidebar se oculta.

**Verdict**: NEEDS_CHANGES

---

## High-level view

El layout envuelve todas las rutas bajo `/admin` con `flex h-screen overflow-hidden` y monta `AdminSidebar` incondicionalmente. El sidebar se encarga de ocultarse a sí mismo en login y access-denied mediante `usePathname`. La lógica es funcional pero desplaza la responsabilidad de exclusión al componente hijo en lugar de al layout, lo que deja el wrapper exterior renderizándose en todas las rutas.

El active state de la mayoría de los enlaces funciona correctamente. El problema está en los dos enlaces de "Citas confirmadas" y "Citas canceladas": usan `href="/admin?status=confirmada"` y `href="/admin?status=cancelada"` con clases CSS escritas a mano, sin pasar por `linkClass()`. Dado que `isActive` compara `pathname` (no incluye query string), estos dos elementos nunca podrán aparecer como activos, pero tampoco reciben el estilo hover correcto al navegar.

El historial de citas lee sus datos desde `readSpaData()` — una función que carga un archivo JSON en disco — y enriquece filas con `spaData.clients` y `spaData.services` del mismo store. No hay llamada a ningún ORM, base de datos ni API en esa ruta. Si los datos de citas historicales se esperan vivos, esta página no los refleja.

---

<details>
<summary>Issues (3)</summary>

1. **Active state faltante en filtros de estado** — Los enlaces "Citas confirmadas" y "Citas canceladas" usan clases hardcodeadas en lugar de `linkClass()`. Nunca recibirán el estilo activo ni el hover coherente con el resto de la navegación. Migrarlos a `linkClass('/admin')` o bien replantear si deben ser subitems sin active state propio.

2. **Exclusión de login/access-denied solo en el sidebar** — El layout renderiza el wrapper `flex h-screen overflow-hidden` para todas las rutas, incluidas `/admin/login` y `/admin/access-denied`. Solo el `<aside>` se oculta. Si esas rutas tienen su propio diseño de pantalla completa, el wrapper exterior puede interferir con el layout. Mover la condición de exclusión al layout, o crear un layout separado para esas rutas.

3. **Historial de citas sobre datos estáticos (JSON)** — `getAppointmentHistory` consume `readSpaData()`, que carga un archivo JSON local. Los datos no vienen de ninguna base de datos en tiempo real. Si se espera que el historial refleje citas reales, esto debe conectarse al origen de datos persistente.

</details>

---

<details>
<summary>Details</summary>

### Active state incompleto en los filtros de citas confirmadas y canceladas

`isActive` evalúa `pathname`, no la URL completa con query string. Los enlaces `/admin?status=confirmada` y `/admin?status=cancelada` tienen `pathname === '/admin'`, por lo que el enlace raíz de "Citas pendientes" los absorbe: cuando el usuario está en cualquiera de esas vistas, el ítem activo visualmente sigue siendo "Citas pendientes". Esto es **confirmed** — se puede verificar directamente en el componente: esos dos `<Link>` tienen clases escritas a mano (`opacity-80 hover:bg-[#2b2b2f]`) en lugar de usar `linkClass()`.

Una opción es tratarlos como subitems sin active state propio (diseño esperado). Si se quiere active state correcto habría que leer `useSearchParams` además de `usePathname`, o redirigir esas vistas a rutas propias (`/admin/appointments/confirmed`, etc.).

### Exclusión layout vs. sidebar

`AdminLayout` monta `AdminSidebar` dentro de `<div className="flex h-screen overflow-hidden ...">` sin condición. El sidebar retorna `null` en login/access-denied, pero el div exterior persiste. Si `/admin/login` renderiza un formulario centrado en pantalla, el contenedor `flex h-screen` puede cortar o redistribuir ese layout según los estilos del hijo. Es **confirmed** que no hay exclusión en el layout — solo en el sidebar.

### Origen de datos del historial

`history/page.tsx` llama a `getAppointmentHistory(...)` y luego cruza los resultados con `readSpaData().clients` y `readSpaData().services` para obtener nombres. `readSpaData` es un store en archivo. No hay fetch a API ni query a base de datos en esta ruta. Los datos de citas históricas son los mismos que el store en disco conoce — **confirmed** por lectura directa del archivo.

</details>

---

<details>
<summary>Archivos revisados</summary>

| Archivo | Cambio |
|---|---|
| `src/app/admin/admin-sidebar.tsx` | Componente nuevo; toda la lógica de navegación lateral, active state con `usePathname`, exclusión condicional para login/access-denied |
| `src/app/admin/layout.tsx` | Ahora monta `AdminSidebar` y provee el wrapper `flex h-screen overflow-hidden`; simplificado a ~10 líneas |
| `src/app/admin/page.tsx` | `<aside>` y wrapper exterior eliminados; devuelve directamente `<main>` |
| `src/app/admin/inventory/inventory-page.tsx` | `<aside>` y wrapper exterior eliminados; devuelve directamente `<main>` |
| `src/app/admin/appointments/history/page.tsx` | `<aside>` y wrapper exterior eliminados; devuelve directamente `<main>` |

</details>
