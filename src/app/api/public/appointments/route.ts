import { requestAppointment } from '@/domain/spa-service';

export async function POST(request: Request) {
  try { return Response.json(requestAppointment(await request.json()), { status: 201 }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'No se pudo registrar la solicitud.' }, { status: 400 }); }
}
