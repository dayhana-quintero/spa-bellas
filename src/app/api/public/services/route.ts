import { getPublicServices } from '@/domain/spa-service';

export function GET() { return Response.json(getPublicServices()); }
