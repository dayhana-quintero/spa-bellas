import type { Service } from '../../shared/types/service';
import { getPublicServices as getPublicServicesFromCatalog } from './public-service-catalog';

export async function getPublicCatalog(): Promise<Service[]> {
  return getPublicServicesFromCatalog();
}

export async function getPublicServices(): Promise<Service[]> {
  return getPublicServicesFromCatalog();
}

export async function getPublicServiceById(id: string): Promise<Service | undefined> {
  const catalog = await getPublicCatalog();
  return catalog.find((service) => service.id === id);
}
