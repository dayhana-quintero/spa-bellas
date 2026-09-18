import { Service } from '../../shared/types/service';
import { listServices } from '../../storage/services';

export function getPublicServices(): Service[] {
  return listServices().filter((service) => service.isActive && service.isBookable);
}
