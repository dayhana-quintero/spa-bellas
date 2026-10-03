import { describe, expect, it } from 'vitest';

import {
  isPubliclyVisible,
  validateServiceCatalog,
} from '../../../src/domain/services/service-catalog-rules';

describe('service catalog rules', () => {
  it('requires an estimated duration for bookable services, including active ones', () => {
    expect(() =>
      validateServiceCatalog({
        id: '123e4567-e89b-12d3-a456-426614174003',
        category: 'masajes',
        name: 'Masaje terapéutico',
        description: 'Masaje profundo para aliviar la tensión muscular.',
        isActive: true,
        isBookable: true,
      }),
    ).toThrow(/duracion estimada|duración estimada/i);
  });

  it('allows inactive or non-bookable services without a duration and exposes only public ones', () => {
    const inactive = {
      id: '123e4567-e89b-12d3-a456-426614174004',
      category: 'faciales',
      name: 'Limpieza facial en pausa',
      description: 'Servicio temporalmente detenido para mantenimiento.',
      isActive: false,
      isBookable: true,
    };

    const archived = {
      id: '123e4567-e89b-12d3-a456-426614174005',
      category: 'faciales',
      name: 'Servicio archivado',
      description: 'Servicio ya no se ofrece al público.',
      isActive: true,
      isBookable: false,
    };

    expect(() => validateServiceCatalog(inactive)).not.toThrow();
    expect(() => validateServiceCatalog(archived)).not.toThrow();
    expect(isPubliclyVisible(inactive)).toBe(false);
    expect(isPubliclyVisible(archived)).toBe(false);
  });
});
