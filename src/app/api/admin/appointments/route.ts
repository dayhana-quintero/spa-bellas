import { listAppointmentsForAdmin } from '@/domain/spa-service';
import { requireAdmin } from '../guard';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const params = new URL(request.url).searchParams;
    return Response.json(await listAppointmentsForAdmin(Object.fromEntries(params.entries())));
  } catch {
    return Response.json({ error: 'No autorizado.' }, { status: 401 });
  }
}
