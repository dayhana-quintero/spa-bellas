import { getAvailableSlots, requestAppointment } from '@/domain/spa-service';

export async function POST(request: Request) {
  try {
    const input = await request.json();
    if (!input.startsAt && input.date && input.slot) {
      const slots = await getAvailableSlots(input.serviceId, input.date);
      const availableSlot = slots.find((slot) => slot.time === input.slot);
      if (!availableSlot) throw new Error('Ese horario ya no está disponible. Selecciona otro horario.');
      input.startsAt = availableSlot.startsAt;
    }
    return Response.json(await requestAppointment(input), { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'No se pudo registrar la solicitud.' }, { status: 400 });
  }
}