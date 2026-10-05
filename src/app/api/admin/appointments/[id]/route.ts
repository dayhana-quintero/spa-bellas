import { changeAppointmentStatusForAdmin, getAppointmentDetailsForAdmin } from '@/domain/spa-service';
import { requireAdmin } from '../../guard';

export async function GET(_request: Request, context: RouteContext<'/api/admin/appointments/[id]'>) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const detail = await getAppointmentDetailsForAdmin(id);
    return detail ? Response.json(detail) : Response.json({ error: 'No encontrada.' }, { status: 404 });
  } catch {
    return Response.json({ error: 'No autorizado.' }, { status: 401 });
  }
}

export async function PATCH(request: Request, context: RouteContext<'/api/admin/appointments/[id]'>) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const updated = await changeAppointmentStatusForAdmin(id, body.status, session.id, body.note);
    return Response.json(updated);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'No se pudo actualizar.' },
      { status: 400 },
    );
  }
}