/* eslint-disable @typescript-eslint/no-require-imports -- el runtime de Node se resuelve de forma sincrona a proposito (el almacenamiento es sincrono). */
export type AdminUserRecord = {
  id: string;
  name: string;
  email?: string;
  role: 'admin' | 'manager' | 'owner';
  accessCode: string;
  isActive: boolean;
};

const DATA_KEY = 'spa-admin-users';

function getNodeRuntime(): {
  fs: typeof import('node:fs');
  path: typeof import('node:path');
} | null {
  if (typeof window !== 'undefined') {
    return null;
  }

  try {
    const fs = require('node:fs') as typeof import('node:fs');
    const path = require('node:path') as typeof import('node:path');
    return { fs, path };
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

function getDataFilePath(): string | null {
  const runtime = getNodeRuntime();
  if (!runtime || typeof process === 'undefined' || !process.cwd) {
    return null;
  }

  return runtime.path.join(process.cwd(), 'data', 'admin-users.json');
}

function defaultAdminUsers(): AdminUserRecord[] {
  return [
    {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Administrador',
      email: 'admin@spa.local',
      role: 'admin',
      accessCode: process.env.ADMIN_ACCESS_CODE ?? 'spa-admin',
      isActive: true,
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      name: 'Manager',
      email: 'manager@spa.local',
      role: 'manager',
      accessCode: process.env.ADMIN_MANAGER_CODE ?? 'spa-manager',
      isActive: true,
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      name: 'Dueño',
      email: 'owner@spa.local',
      role: 'owner',
      accessCode: process.env.ADMIN_OWNER_CODE ?? 'spa-owner',
      isActive: true,
    },
  ];
}

function readPersistedUsers(): AdminUserRecord[] {
  const browserStorage = getBrowserStorage();
  if (browserStorage) {
    try {
      const raw = browserStorage.getItem(DATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AdminUserRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore invalid localStorage payloads and fall through to defaults.
    }
  }

  const runtime = getNodeRuntime();
  const dataPath = getDataFilePath();
  if (!runtime || !dataPath) {
    return defaultAdminUsers();
  }

  if (!runtime.fs.existsSync(dataPath)) {
    runtime.fs.mkdirSync(runtime.path.dirname(dataPath), { recursive: true });
    runtime.fs.writeFileSync(dataPath, JSON.stringify(defaultAdminUsers(), null, 2));
    return defaultAdminUsers();
  }

  try {
    const raw = runtime.fs.readFileSync(dataPath, 'utf8');
    const parsed = JSON.parse(raw) as AdminUserRecord[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultAdminUsers();
  } catch {
    return defaultAdminUsers();
  }
}

function writePersistedUsers(users: AdminUserRecord[]): void {
  const browserStorage = getBrowserStorage();
  if (browserStorage) {
    browserStorage.setItem(DATA_KEY, JSON.stringify(users, null, 2));
    return;
  }

  const runtime = getNodeRuntime();
  const dataPath = getDataFilePath();
  if (!runtime || !dataPath) {
    return;
  }

  runtime.fs.mkdirSync(runtime.path.dirname(dataPath), { recursive: true });
  runtime.fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
}

export function getAdminUsers(): AdminUserRecord[] {
  return readPersistedUsers().filter((user) => user.isActive && user.accessCode.trim().length > 0);
}

export function findAdminUserByCode(code: unknown): AdminUserRecord | null {
  if (typeof code !== 'string' || !code.trim()) {
    return null;
  }

  const normalizedCode = code.trim();
  const user = getAdminUsers().find((item) => item.accessCode === normalizedCode);
  if (!user) {
    return null;
  }

  return user;
}

export function saveAdminUser(user: AdminUserRecord): AdminUserRecord {
  const users = readPersistedUsers();
  const nextUsers = users.some((item) => item.id === user.id)
    ? users.map((item) => (item.id === user.id ? user : item))
    : [...users, user];

  writePersistedUsers(nextUsers);
  return user;
}
