import { describe, expect, it, vi, beforeEach } from 'vitest';

import { getPublicServices } from '../../../src/domain/services/public-service-catalog';

vi.mock('../../../src/domain/spa-service', () => ({
  listServices: vi.fn(),
}));

import { listServices } from '../../../src/domain/spa-service';

describe('public service catalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes only active and bookable services to the public', async () => {
    const active = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      category: 'masajes',
      name: 'Masaje relajante',
      description: 'Masaje suave para reducir el estrés y la tensión.',
      estimatedDuration: 60,
      priceDisplay: '$1200',
      isActive: true,
      isBookable: true,
    };

    const hidden = {
      ...active,
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Servicio no publicado',
      isActive: false,
      isBookable: true,
    };

    const archived = {
      ...active,
      id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Servicio archivado',
      isActive: true,
      isBookable: false,
    };

    vi.mocked(listServices).mockResolvedValue([active, hidden, archived]);

    await expect(getPublicServices()).resolves.toEqual([active]);
  });
});
