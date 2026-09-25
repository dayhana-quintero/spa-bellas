import { randomUUID } from 'crypto';
import { type Cliente, clienteSchema } from '@/shared/types/client';

const clients: Cliente[] = [];

export function createClient(data: Omit<Cliente, 'id' | 'createdAt'>): Cliente {
  const client = clienteSchema.parse({
    ...data,
    id: randomUUID(),
    createdAt: new Date(),
  });

  clients.push(client);
  return client;
}

export function findClientByPhone(phone: string): Cliente | undefined {
  return clients.find((c) => c.phone === phone);
}

export function findClientById(id: string): Cliente | undefined {
  return clients.find((c) => c.id === id);
}

// Solo para tests: limpia el estado en memoria entre corridas.
export function _resetClients(): void {
  clients.length = 0;
}