import { recordSupplyMovementForAdmin } from '@/domain/inventory/inventory-service';
import { requireAdmin } from '../../../guard';

export async function POST(request: Request, context: RouteContext<'/api/admin/supplies/[id]/movements'>) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return Response.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const movement = await recordSupplyMovementForAdmin({
      ...(await request.json()),
      supplyId: id,
      adminId: session.id,
    });
    return Response.json(movement, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'No se pudo registrar el movimiento.' }, { status: 400 });
  }
}
