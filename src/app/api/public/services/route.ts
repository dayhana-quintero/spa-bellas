import { getPublicServices } from '@/domain/spa-service';

export async function GET() {
  const services = await getPublicServices();
  return Response.json(services);
}