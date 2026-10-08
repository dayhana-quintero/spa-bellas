import { getAvailableSlots } from '@/domain/spa-service';
import { requireAdmin } from '../guard';

// Horarios libres del servicio de una cita, excluyendo la propia cita del
// calculo de ocupacion para poder reprogramarla (spec 004, FR-002/FR-004).
export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const url = new URL(request.url);
  const serviceId = url.searchParams.get('serviceId') ?? '';
  const date = url.searchParams.get('date') ?? '';
  const appointmentId = url.searchParams.get('appointmentId') ?? '';

  if (!serviceId || !appointmentId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'Parametros invalidos.' }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots(serviceId, date, {
      excludeAppointmentId: appointmentId,
      excludePast: true,
    });
    return Response.json(slots);
  } catch (error) {
    console.error('Admin slots load failed:', error);
    return Response.json({ error: 'No se pudieron cargar los horarios.' }, { status: 500 });
  }
}
