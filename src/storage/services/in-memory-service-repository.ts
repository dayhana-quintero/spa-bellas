import { Service, serviceSchema } from '@/shared/types/service';
import { randomUUID } from 'crypto';



const services: Service[] = [];

export function createService(data: Omit<Service, 'id'>): Service {
  const service = serviceSchema.parse({
    ...data,
    id: randomUUID(),
  });

  services.push(service);
  return service;
}

export function findServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

// Solo para tests: limpia el estado en memoria entre corridas.
export function _resetServices(): void {
  services.length = 0;
}