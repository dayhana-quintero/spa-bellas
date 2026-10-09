// Limpia en Supabase las citas que acumula la suite e2e y barre todo dato
// huerfano del dominio de citas (comunicaciones, historial y clientes sin cita).
//
// Uso: node scripts/limpiar-citas-de-prueba.mjs
//
// Borra en orden seguro:
//   1. Comunicaciones e historial de las citas de prueba (y de las rotas).
//   2. Citas de prueba y citas con cliente o servicio inexistente.
//   3. Comunicaciones e historial cuya cita ya no exista.
//   4. Clientes sin ninguna cita (huerfanos por definicion).
// Solo toca los patrones de prueba conocidos:
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

async function allIds(table) {
  return must(await supabase.from(table).select('id'), `al consultar ${table}`).map(
    (row) => row.id,
  );
}

// ---------------------------------------------------------------------------
// 1) Citas de prueba (patrones conocidos) y citas rotas (cliente/servicio ausente)
// ---------------------------------------------------------------------------

const testClients = must(
  await supabase.from('clients').select('id').eq('name', TEST_CLIENT_NAME),
  'al consultar clientes de prueba',
);

const legacyFixtureClients = must(
  await supabase.from('clients').select('id').ilike('phone', `%${TEST_FIXTURE_PHONE}%`),
  'al consultar clientes con telefono de fixture antiguo',
);

const testClientIds = [
  ...new Set([...testClients, ...legacyFixtureClients].map((client) => client.id)),
];

const appointmentsByNote = must(
  await supabase
    .from('appointments')
    .select('id, client_id')
    .ilike('notes', `%${TEST_BOOKING_NOTE}%`),
  'al consultar citas por nota de prueba',
);

let appointmentsByClient = [];
if (testClientIds.length > 0) {
  appointmentsByClient = must(
    await supabase.from('appointments').select('id, client_id').in('client_id', testClientIds),
    'al consultar citas de clientes de prueba',
  );
}

const [appointmentIds, clientIds, serviceIds] = await Promise.all([
  allIds('appointments'),
  allIds('clients'),
  allIds('services'),
]);
const appointmentIdSet = new Set(appointmentIds);
const clientIdSet = new Set(clientIds);
const serviceIdSet = new Set(serviceIds);

const appointmentRows = must(
  await supabase.from('appointments').select('id, client_id, service_id'),
  'al consultar citas para detectar rotas',
);

// Una cita con cliente o servicio inexistente es inutilizable: se elimina junto
// con sus registros dependientes (la FK de servicio pone NULL al borrar).
const brokenAppointmentIds = appointmentRows
  .filter(
    (row) =>
      !row.client_id || !clientIdSet.has(row.client_id) || !row.service_id || !serviceIdSet.has(row.service_id),
  )
  .map((row) => row.id);

const doomedAppointmentIds = [
  ...new Set([
    ...appointmentsByNote.map((item) => item.id),
    ...appointmentsByClient.map((item) => item.id),
    ...brokenAppointmentIds,
  ]),
].filter((id) => appointmentIdSet.has(id));

// ---------------------------------------------------------------------------
// 2) Barrido de huerfanos: registros cuya cita ya no existe
// ---------------------------------------------------------------------------

const communicationsRows = must(
  await supabase.from('whatsapp_communications').select('id, appointment_id'),
  'al consultar comunicaciones',
);
const historyRows = must(
  await supabase.from('appointment_status_history').select('id, appointment_id'),
  'al consultar historial de estados',
);

const orphanCommunicationIds = communicationsRows
  .filter((row) => !appointmentIdSet.has(row.appointment_id))
  .map((row) => row.id);
const orphanHistoryIds = historyRows
  .filter((row) => !appointmentIdSet.has(row.appointment_id))
  .map((row) => row.id);

// ---------------------------------------------------------------------------
// 3) Resumen previo
// ---------------------------------------------------------------------------

const clientRows = must(
  await supabase.from('clients').select('id'),
  'al consultar clientes para detectar huerfanos',
);
const remainingClientIds = new Set(
  appointmentRows
    .filter((row) => !doomedAppointmentIds.includes(row.id))
    .map((row) => row.client_id)
    .filter(Boolean),
);
const orphanClientIds = clientRows.filter((row) => !remainingClientIds.has(row.id)).map((row) => row.id);

const nothingToDo =
  doomedAppointmentIds.length === 0 &&
  orphanCommunicationIds.length === 0 &&
  orphanHistoryIds.length === 0 &&
  orphanClientIds.length === 0;

if (nothingToDo) {
  console.log('La base esta limpia: no hay citas de prueba ni datos huerfanos.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 4) Borrado (hijos antes que padres; clientes al final)
// ---------------------------------------------------------------------------

const allDoomedComms = [
  ...communicationsRows
    .filter((row) => doomedAppointmentIds.includes(row.appointment_id))
    .map((row) => row.id),
  ...orphanCommunicationIds,
];
const allDoomedHistory = [
  ...historyRows
    .filter((row) => doomedAppointmentIds.includes(row.appointment_id))
    .map((row) => row.id),
  ...orphanHistoryIds,
];

let communicationsDeleted = 0;
if (allDoomedComms.length > 0) {
  communicationsDeleted = must(
    await supabase.from('whatsapp_communications').delete().in('id', allDoomedComms).select('id'),
    'al borrar comunicaciones',
  ).length;
}

let historyDeleted = 0;
if (allDoomedHistory.length > 0) {
  historyDeleted = must(
    await supabase.from('appointment_status_history').delete().in('id', allDoomedHistory).select('id'),
    'al borrar historial de estados',
  ).length;
}

let appointmentsDeleted = 0;
if (doomedAppointmentIds.length > 0) {
  appointmentsDeleted = must(
    await supabase.from('appointments').delete().in('id', doomedAppointmentIds).select('id'),
    'al borrar citas',
  ).length;
}

// Clientes que quedaron sin ninguna cita (los reales siempre conservan la suya).
let clientsDeleted = 0;
if (orphanClientIds.length > 0) {
  clientsDeleted = must(
    await supabase.from('clients').delete().in('id', orphanClientIds).select('id'),
    'al borrar clientes huerfanos',
  ).length;
}

console.log('Limpieza completada:');
console.log(`  - ${communicationsDeleted} comunicaciones de WhatsApp`);
console.log(`  - ${historyDeleted} registros de historial de estados`);
console.log(`  - ${appointmentsDeleted} citas (${brokenAppointmentIds.length} rotas incluidas)`);
console.log(`  - ${clientsDeleted} clientes sin citas`);
