import { listServices, saveService } from '@/domain/spa-service';
import { requireAdmin } from '../guard';

export async function GET() { try { await requireAdmin(); return Response.json(listServices()); } catch { return Response.json({ error: 'No autorizado.' }, { status: 401 }); } }
export async function POST(request: Request) { try { await requireAdmin(); return Response.json(saveService(await request.json()), { status: 201 }); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'No se pudo guardar.' }, { status: 400 }); } }
export async function PUT(request: Request) { try { await requireAdmin(); return Response.json(saveService(await request.json())); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'No se pudo guardar.' }, { status: 400 }); } }
