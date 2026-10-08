import type { Service } from '@/shared/types/service';

import { listServices, saveService } from '@/domain/spa-service';
import {
  countAppointmentsByServiceFromSupabase,
  deleteServiceFromSupabase,
} from '@/lib/supabase-data';
import { validateServiceCatalog } from './service-catalog-rules';

export type AdminServiceInput = Omit<Service, 'id'> & { id?: string };

export type ServiceDeleteErrorReason = 'not-found' | 'has-appointments';

/** Error de borrado con motivo codificado para que la ruta responda 404/409. */
export class ServiceDeleteError extends Error {
  readonly reason: ServiceDeleteErrorReason;

  constructor(reason: ServiceDeleteErrorReason, message: string) {
    super(message);
    this.name = 'ServiceDeleteError';
    this.reason = reason;
  }
}

/**
 * Elimina un servicio del catalogo. Si alguna cita lo referencia se rechaza:
 * la FK pondria service_id a null y dejaria citas sin servicio; en su lugar se
 * desactiva el servicio con toggleServicePublication.
 */
export async function deleteAdminService(id: string): Promise<void> {
  const services = await listServices();
  const service = services.find((item) => item.id === id);
  if (!service) {
    throw new ServiceDeleteError('not-found', 'No se encontró el servicio.');
  }

  const appointmentCount = await countAppointmentsByServiceFromSupabase(id);
  if (appointmentCount > 0) {
    throw new ServiceDeleteError(
      'has-appointments',
      'No se puede eliminar: tiene citas asociadas. Desactívalo para ocultarlo.',
    );
  }

  await deleteServiceFromSupabase(id);
}

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
