import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ServiceDeleteError,
  deleteAdminService,
} from '../../../src/domain/services/admin-service-catalog';
import { listServices } from '../../../src/domain/spa-service';
import {
  countAppointmentsByServiceFromSupabase,
  deleteServiceFromSupabase,
} from '../../../src/lib/supabase-data';

vi.mock('../../../src/domain/spa-service', () => ({
  listServices: vi.fn(),
  saveService: vi.fn(),
}));

vi.mock('../../../src/lib/supabase-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/lib/supabase-data')>();
  return {
    ...actual,
    countAppointmentsByServiceFromSupabase: vi.fn(),
    deleteServiceFromSupabase: vi.fn(),
  };
});

const SERVICE_ID = '123e4567-e89b-12d3-a456-426614174099';

const service = {
  id: SERVICE_ID,
  category: 'Masajes',
  name: 'Masaje de prueba',
  description: 'Servicio creado para probar el borrado del catalogo.',
  estimatedDuration: 60,
  priceDisplay: '$80.000',
  isActive: true,
  isBookable: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listServices).mockResolvedValue([service]);
  vi.mocked(countAppointmentsByServiceFromSupabase).mockResolvedValue(0);
  vi.mocked(deleteServiceFromSupabase).mockResolvedValue(undefined);
});

describe('deleteAdminService', () => {
  it('elimina un servicio del catalogo cuando ninguna cita lo referencia', async () => {
    await deleteAdminService(SERVICE_ID);

    expect(countAppointmentsByServiceFromSupabase).toHaveBeenCalledWith(SERVICE_ID);
    expect(deleteServiceFromSupabase).toHaveBeenCalledWith(SERVICE_ID);
  });

  it('rechaza el borrado si el servicio tiene citas asociadas', async () => {
    vi.mocked(countAppointmentsByServiceFromSupabase).mockResolvedValue(3);

    const error = await deleteAdminService(SERVICE_ID).catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ServiceDeleteError);
    expect((error as ServiceDeleteError).reason).toBe('has-appointments');
    expect((error as Error).message).toContain('citas asociadas');
    expect(deleteServiceFromSupabase).not.toHaveBeenCalled();
  });

  it('rechaza el borrado de un servicio inexistente sin tocar la base', async () => {
    vi.mocked(listServices).mockResolvedValue([]);

    const error = await deleteAdminService(SERVICE_ID).catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ServiceDeleteError);
    expect((error as ServiceDeleteError).reason).toBe('not-found');
    expect(countAppointmentsByServiceFromSupabase).not.toHaveBeenCalled();
    expect(deleteServiceFromSupabase).not.toHaveBeenCalled();
  });
});
