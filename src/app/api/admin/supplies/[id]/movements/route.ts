import { recordSupplyMovement } from '@/domain/spa-service';
import { requireAdmin } from '../../../guard';

export async function POST(request: Request, context: RouteContext<'/api/admin/supplies/[id]/movements'>) {
  try { const session = await requireAdmin(); const { id } = await context.params; return Response.json(recordSupplyMovement({ ...(await request.json()), supplyId: id, adminId: session.id }), { status: 201 }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'No se pudo registrar el movimiento.' }, { status: 400 }); }
}
