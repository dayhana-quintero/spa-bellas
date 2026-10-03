import type { Appointment } from '@/shared/types/appointment';
import type { AppointmentStatusRecord } from '@/shared/types/appointment-status';
import type { Cliente } from '@/shared/types/client';
import type { Service } from '@/shared/types/service';
import type { Supply } from '@/shared/types/supply';
import type { SupplyMovement } from '@/shared/types/supply-movement';

export type AvailabilitySettings = {
  spaCapacity: number;
  bufferBetweenAppointments: number;
  defaultHoldDuration: number;
  workingDays: string[];
  nonWorkingDays: string[];
  openingHours: Record<string, { opensAt: number; closesAt: number }>;
  adminBlocks: Array<{ startsAt: string; endsAt: string; reason?: string }>;
};

type SpaData = {
  clients: Cliente[];
  services: Service[];
  appointments: Appointment[];
  statusRecords: AppointmentStatusRecord[];
  supplies: Supply[];
  supplyMovements: SupplyMovement[];
  availability: AvailabilitySettings;
};

const categories = ['unas', 'alisados', 'tratamientos capilares', 'limpieza facial', 'diseno de cejas'];
const DATA_KEY = 'spa-data';

function getNodeRuntime(): {
  fs: typeof import('node:fs');
  path: typeof import('node:path');
  crypto: typeof import('node:crypto');
} | null {
  if (typeof window !== 'undefined') {
    return null;
  }

  try {
    const fs = require('node:fs') as typeof import('node:fs');
    const path = require('node:path') as typeof import('node:path');
    const crypto = require('node:crypto') as typeof import('node:crypto');
    return { fs, path, crypto };
  } catch {
    return null;
  }
}

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function randomId(): string {
  const runtime = getNodeRuntime();
  if (runtime?.crypto?.randomUUID) {
    return runtime.crypto.randomUUID();
  }

  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getDataFilePath(): string | null {
  const runtime = getNodeRuntime();
  if (!runtime || typeof process === 'undefined' || !process.cwd) {
    return null;
  }

  return runtime.path.join(process.cwd(), 'data', 'spa-data.json');
}

function seedService(category: string, name: string, duration: number): Service {
  return {
    id: randomId(),
    category,
    name,
    description: `Servicio profesional de ${name.toLowerCase()} para el cuidado y bienestar de cada cliente.`,
    estimatedDuration: duration,
    isActive: true,
    isBookable: true,
  };
}

function defaultData(): SpaData {
  return {
    clients: [],
    services: [
      seedService(categories[0], 'Manicura clasica', 60),
      seedService(categories[1], 'Alisado profesional', 150),
      seedService(categories[2], 'Tratamiento hidratante', 75),
      seedService(categories[3], 'Limpieza facial', 60),
      seedService(categories[4], 'Diseno de cejas', 45),
    ],
    appointments: [],
    statusRecords: [],
    supplies: [],
    supplyMovements: [],
    availability: {
      spaCapacity: 1,
      bufferBetweenAppointments: 15,
      defaultHoldDuration: 15,
      workingDays: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
      nonWorkingDays: [],
      openingHours: {
        lunes: { opensAt: 540, closesAt: 1020 }, martes: { opensAt: 540, closesAt: 1020 },
        miercoles: { opensAt: 540, closesAt: 1020 }, jueves: { opensAt: 540, closesAt: 1020 },
        viernes: { opensAt: 540, closesAt: 1020 }, sabado: { opensAt: 540, closesAt: 840 },
      },
      adminBlocks: [],
    },
  };
}

function hydrate(data: SpaData): SpaData {
  return {
    ...data,
    clients: data.clients.map((item) => ({ ...item, createdAt: new Date(item.createdAt) })),
    appointments: data.appointments.map((item) => ({ ...item, scheduledStart: new Date(item.scheduledStart), scheduledEnd: new Date(item.scheduledEnd), holdExpiresAt: item.holdExpiresAt ? new Date(item.holdExpiresAt) : undefined, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) })),
    statusRecords: data.statusRecords.map((item) => ({ ...item, changedAt: new Date(item.changedAt) })),
    supplyMovements: data.supplyMovements.map((item) => ({ ...item, createdAt: new Date(item.createdAt) })),
  };
}

function read(): SpaData {
  const browserStorage = getBrowserStorage();
  if (browserStorage) {
    try {
      const raw = browserStorage.getItem(DATA_KEY);
      return raw ? hydrate(JSON.parse(raw) as SpaData) : defaultData();
    } catch {
      return defaultData();
    }
  }

  const dataPath = getDataFilePath();
  const runtime = getNodeRuntime();
  if (!runtime || !dataPath) {
    return defaultData();
  }

  if (!runtime.fs.existsSync(dataPath)) return defaultData();
  try { return hydrate(JSON.parse(runtime.fs.readFileSync(dataPath, 'utf8')) as SpaData); } catch { return defaultData(); }
}

function write(data: SpaData): void {
  const browserStorage = getBrowserStorage();
  if (browserStorage) {
    browserStorage.setItem(DATA_KEY, JSON.stringify(data, null, 2));
    return;
  }

  const runtime = getNodeRuntime();
  const dataPath = getDataFilePath();
  if (!runtime || !dataPath) {
    return;
  }

  runtime.fs.mkdirSync(runtime.path.dirname(dataPath), { recursive: true });
  runtime.fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export function withSpaData<T>(operation: (data: SpaData) => T): T {
  const data = read();
  const result = operation(data);
  write(data);
  return result;
}

export function readSpaData(): SpaData { return read(); }
export function createId(): string { return randomId(); }
export { categories };
