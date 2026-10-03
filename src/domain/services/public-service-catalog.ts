import { Service } from '../../shared/types/service';
import { listServices } from '../../storage/services';
import { isPubliclyVisible } from './service-catalog-rules';

export function getPublicServices(): Service[] {
  return listServices().filter((service) => isPubliclyVisible(service));
}
