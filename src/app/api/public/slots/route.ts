import { getAvailableSlots } from '@/domain/spa-service';

export function GET(request: Request) { const url = new URL(request.url); return Response.json(getAvailableSlots(url.searchParams.get('serviceId') ?? '', url.searchParams.get('date') ?? '')); }
