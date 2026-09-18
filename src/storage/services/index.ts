import { InMemoryRepository } from '../index';
import { Service } from '../../shared/types/service';

const serviceRepo = new InMemoryRepository<Service>();

const seedServices: Service[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    category: 'masajes',
    name: 'Masaje relajante',
    description: 'Masaje suave para reducir el estrés y la tensión.',
    estimatedDuration: 60,
    priceDisplay: '$1200',
    isActive: true,
    isBookable: true,
  },
];

seedServices.forEach((service) => serviceRepo.save(service));

export function listServices(): Service[] {
  return serviceRepo.list();
}

export function saveService(service: Service): Service {
  return serviceRepo.save(service);
}

export function clearServices(): void {
  serviceRepo.clear();
}
