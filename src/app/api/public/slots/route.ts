import { getAvailableSlots } from '@/domain/spa-service';

export async function GET(request: Request) {
  const url = new URL(request.url);
  // La reserva publica nunca ofrece horas que ya pasaron hoy (a diferencia de
  // la reprogramacion del admin, que controla esto con excludePast).
  const slots = await getAvailableSlots(url.searchParams.get('serviceId') ?? '', url.searchParams.get('date') ?? '', {
    excludePast: true,
  });
  return Response.json(slots);
}