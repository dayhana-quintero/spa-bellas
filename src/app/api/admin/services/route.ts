import { listServices, saveService } from '@/domain/spa-service';
import { requireAdmin } from '../guard';

export async function GET() {
  try {
    await requireAdmin();
    const services = await listServices();
    return Response.json(services);
  } catch {
    return Response.json({ error: 'No autorizado.' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const service = await saveService(body);
    return Response.json(service, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'No se pudo guardar.' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const service = await saveService(body);
    return Response.json(service);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'No se pudo guardar.' }, { status: 400 });
  }
}
