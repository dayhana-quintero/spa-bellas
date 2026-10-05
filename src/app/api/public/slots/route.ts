import { getAvailableSlots } from '@/domain/spa-service';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slots = await getAvailableSlots(url.searchParams.get('serviceId') ?? '', url.searchParams.get('date') ?? '');
  return Response.json(slots);
}