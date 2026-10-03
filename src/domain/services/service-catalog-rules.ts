import type { Service } from '@/shared/types/service';

export type ServiceCatalogInput = Partial<Pick<Service, 'id'>> &
  Pick<Service, 'category' | 'name' | 'description' | 'estimatedDuration' | 'isActive' | 'isBookable'>;

export function isPubliclyVisible(service: ServiceCatalogInput): boolean {
  return service.isActive && service.isBookable;
}

export function validateServiceCatalog(input: ServiceCatalogInput): void {
  const category = input.category?.trim();
  const name = input.name?.trim();
  const description = input.description?.trim();

  if (!category || category.length < 2) {
    throw new Error('La categoria del servicio es obligatoria.');
  }

  if (!name || name.length < 3) {
    throw new Error('El nombre del servicio es obligatorio.');
  }

  if (!description || description.length < 15) {
    throw new Error('La descripcion del servicio debe tener al menos 15 caracteres.');
  }

  if (input.isActive && input.isBookable && !input.estimatedDuration) {
    throw new Error('Un servicio agendable requiere duracion estimada.');
  }

  if (input.estimatedDuration !== undefined && input.estimatedDuration <= 0) {
    throw new Error('La duracion estimada debe ser mayor que cero.');
  }
}
