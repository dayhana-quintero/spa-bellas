// Limpia en Supabase las citas que acumula la suite e2e (clientes de prueba).
//
// Uso: node scripts/limpiar-citas-de-prueba.mjs
//
// Borra en orden seguro: comunicaciones de WhatsApp, historial de estados,
// las citas y por ultimo los clientes que queden sin citas. Solo toca los
// patrones de prueba conocidos:
//   - clientes llamados "Trazabilidad WhatsApp" (fixtures de e2e)
//   - reservas con la nota "Necesito relajación profunda." (public-booking)
//   - clientes con el telefono fijo 5512345678 (fixtures antiguos de e2e)
import { existsSync, readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const envPath = ['.env.local', '.env'].find((candidate) => existsSync(candidate));
if (!envPath) {
  throw new Error('Falta .env.local (o .env) con las claves de Supabase.');
}

const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
}

const supabase = createClient(url, serviceKey);

function must({ data, error }, context) {
  if (error) throw new Error(`${context}: ${error.message}`);
  return data ?? [];
}

const TEST_CLIENT_NAME = 'Trazabilidad WhatsApp';
const TEST_BOOKING_NOTE = 'relajación profunda';
const TEST_FIXTURE_PHONE = '5512345678';

// 1) Clientes de prueba conocidos.
const testClients = must(
  await supabase.from('clients').select('id').eq('name', TEST_CLIENT_NAME),
  'al consultar clientes de prueba',
);

// 1b) Clientes con el telefono fijo de los fixtures antiguos.
const legacyFixtureClients = must(
  await supabase.from('clients').select('id').ilike('phone', `%${TEST_FIXTURE_PHONE}%`),
  'al consultar clientes con telefono de fixture antiguo',
);

// 2) Citas creadas por la reserva publica de los tests (por su nota).
const appointmentsByNote = must(
  await supabase
    .from('appointments')
    .select('id, client_id')
    .ilike('notes', `%${TEST_BOOKING_NOTE}%`),
  'al consultar citas por nota de prueba',
);

// 3) Todas las citas de los clientes de prueba (cualquier estado).
const testClientIds = [
  ...new Set([...testClients, ...legacyFixtureClients].map((client) => client.id)),
];
let appointmentsByClient = [];
if (testClientIds.length > 0) {
  appointmentsByClient = must(
    await supabase.from('appointments').select('id, client_id').in('client_id', testClientIds),
    'al consultar citas de clientes de prueba',
  );
}

const appointmentIds = [
  ...new Set([...appointmentsByNote, ...appointmentsByClient].map((item) => item.id)),
];
const clientIds = [
  ...new Set([
    ...testClientIds,
    ...appointmentsByNote.map((item) => item.client_id),
    ...appointmentsByClient.map((item) => item.client_id),
  ]),
];

if (appointmentIds.length === 0) {
  console.log('No hay citas de prueba que limpiar.');
  process.exit(0);
}

// 4) Borrado en orden seguro (hijos antes que padres).
const communications = must(
  await supabase
    .from('whatsapp_communications')
    .delete()
    .in('appointment_id', appointmentIds)
    .select('id'),
  'al borrar comunicaciones de WhatsApp',
);

const history = must(
  await supabase
    .from('appointment_status_history')
    .delete()
    .in('appointment_id', appointmentIds)
    .select('id'),
  'al borrar historial de estados',
);

const appointments = must(
  await supabase.from('appointments').delete().in('id', appointmentIds).select('id'),
  'al borrar citas',
);

// 5) Clientes que quedaron sin citas (los que aun tengan citas reales se conservan).
const remaining = must(
  await supabase.from('appointments').select('id, client_id').in('client_id', clientIds),
  'al verificar clientes con citas restantes',
);
const busyClientIds = new Set(remaining.map((item) => item.client_id));
const orphanClientIds = clientIds.filter((id) => !busyClientIds.has(id));

let clients = [];
if (orphanClientIds.length > 0) {
  clients = must(
    await supabase.from('clients').delete().in('id', orphanClientIds).select('id'),
    'al borrar clientes huermanos',
  );
}

console.log('Limpieza de datos de prueba completada:');
console.log(`  - ${communications.length} comunicaciones de WhatsApp`);
console.log(`  - ${history.length} registros de historial de estados`);
console.log(`  - ${appointments.length} citas`);
console.log(`  - ${clients.length} clientes sin citas`);
