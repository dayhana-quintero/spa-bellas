import type { Service } from '@/shared/types/service';

import { listServices, saveService } from '@/domain/spa-service';
import { validateServiceCatalog } from './service-catalog-rules';

export type AdminServiceInput = Omit<Service, 'id'> & { id?: string };

export async function listAdminServices(): Promise<Service[]> {
  return listServices();
}

export async function saveAdminService(input: AdminServiceInput): Promise<Service> {
  const normalized: AdminServiceInput = {
    ...input,
    category: input.category.trim(),
    name: input.name.trim(),
    description: input.description.trim(),
    priceDisplay: input.priceDisplay?.trim() || undefined,
    estimatedDuration: input.estimatedDuration ?? undefined,
    isActive: input.isActive ?? true,
    isBookable: input.isBookable ?? true,
  };

  validateServiceCatalog(normalized);
  return saveService(normalized as Service);
}

export async function toggleServicePublication(id: string, nextIsActive?: boolean): Promise<Service> {
  const services = await listServices();
  const service = services.find((item) => item.id === id);
  if (!service) {
    throw new Error('No se encontró el servicio.');
  }

  return saveAdminService({
    ...service,
    isActive: nextIsActive ?? !service.isActive,
  });
}

export async function toggleServiceBooking(id: string, nextIsBookable?: boolean): Promise<Service> {
  const services = await listServices();
  const service = services.find((item) => item.id === id);
  if (!service) {
    throw new Error('No se encontró el servicio.');
  }

  return saveAdminService({
    ...service,
    isBookable: nextIsBookable ?? !service.isBookable,
  });
}
