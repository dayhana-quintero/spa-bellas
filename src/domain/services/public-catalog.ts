import type { Service } from '../../shared/types/service';
import { getPublicServices as getPublicServicesFromCatalog } from './public-service-catalog';

export function getPublicCatalog(): Service[] {
  return getPublicServicesFromCatalog();
}

export function getPublicServices(): Service[] {
  return getPublicServicesFromCatalog();
}

export function getPublicServiceById(id: string): Service | undefined {
  return getPublicCatalog().find((service) => service.id === id);
}
