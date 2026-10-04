import { Service } from '../../shared/types/service';
import { listServices } from '../../domain/spa-service';
import { isPubliclyVisible } from './service-catalog-rules';

export async function getPublicServices(): Promise<Service[]> {
  const all = await listServices();
  return all.filter((service) => isPubliclyVisible(service));
}
