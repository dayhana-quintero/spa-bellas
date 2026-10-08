import {
  ServiceDeleteError,
  deleteAdminService,
} from '@/domain/services/admin-service-catalog';
import { requireAdmin } from '../../guard';

type ServiceContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: ServiceContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteAdminService(id);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return Response.json({ error: 'No autorizado.' }, { status: 401 });
    }

    if (error instanceof ServiceDeleteError) {
      return Response.json(
        { error: error.message, reason: error.reason },
        { status: error.reason === 'has-appointments' ? 409 : 404 },
      );
    }

    return Response.json(
      { error: error instanceof Error ? error.message : 'No se pudo eliminar el servicio.' },
      { status: 400 },
    );
  }
}
