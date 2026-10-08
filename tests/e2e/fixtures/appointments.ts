import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Crea una cita pendiente real contra la API publica y devuelve su id.
 *
 * Usa una fecha lejana y el ultimo horario del dia para no competir con el
 * resto de la suite por los mismos huecos.
 */
export async function createPendingAppointment(page: Page): Promise<string> {
  const servicesResponse = await page.request.get('/api/public/services');
  const services = (await servicesResponse.json()) as Array<{ id: string }>;

  let booking: { serviceId: string; date: string; slot: string } | undefined;

  for (let offset = 10; offset <= 40 && !booking; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const dateString = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');

    for (const service of services) {
      const response = await page.request.get(
        `/api/public/slots?serviceId=${service.id}&date=${dateString}`,
      );
      const slots = (await response.json()) as Array<{ time: string }>;
      if (slots[0]) {
        booking = { serviceId: service.id, date: dateString, slot: slots[slots.length - 1].time };
        break;
      }
    }
  }

  expect(booking, 'Debe existir al menos un servicio y horario disponible').toBeDefined();

  const createdResponse = await page.request.post('/api/public/appointments', {
    data: {
      clientName: 'Trazabilidad WhatsApp',
      clientPhone: '5512345678',
      serviceId: booking!.serviceId,
      date: booking!.date,
      slot: booking!.slot,
      whatsappConsent: true,
    },
  });
  const created = (await createdResponse.json()) as { id?: string; error?: string };

  expect(createdResponse.ok(), created.error ?? '').toBeTruthy();
  expect(created.id).toBeTruthy();

  return created.id as string;
}
