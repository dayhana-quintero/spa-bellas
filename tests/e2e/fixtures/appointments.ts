import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Telefono distinto por creacion: evita que pruebas en paralelo compartan el
 * mismo cliente y generen registros duplicados.
 */
export function uniqueClientPhone(): string {
  let digits = '';
  for (let index = 0; index < 9; index += 1) {
    digits += Math.floor(Math.random() * 10);
  }
  return `3${digits}`;
}

/**
 * Crea una cita pendiente real contra la API publica y devuelve su id.
 *
 * Usa fechas lejanas y el ultimo horario del dia para no competir con el resto
 * de la suite, y reintenta con dias siguientes si otro proceso toma ese hueco
 * entre la consulta de horarios y el envio de la solicitud.
 */
export async function createPendingAppointment(page: Page): Promise<string> {
  const servicesResponse = await page.request.get('/api/public/services');
  const services = (await servicesResponse.json()) as Array<{ id: string }>;

  let lastError = '';

  for (let attempt = 0; attempt < 8; attempt += 1) {
    let booking: { serviceId: string; date: string; slot: string } | undefined;

    for (let offset = 10 + attempt; offset <= 40 && !booking; offset += 1) {
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

    if (!booking) {
      lastError = lastError || 'No hay horarios libres para la cita de prueba.';
      break;
    }

    const createdResponse = await page.request.post('/api/public/appointments', {
      data: {
        clientName: 'Trazabilidad WhatsApp',
        clientPhone: uniqueClientPhone(),
        serviceId: booking.serviceId,
        date: booking.date,
        slot: booking.slot,
        whatsappConsent: true,
      },
    });
    const created = (await createdResponse.json()) as { id?: string; error?: string };

    if (createdResponse.ok() && created.id) return created.id;

    lastError = created.error ?? '';
    // Solo conviene reintentar si el problema fue el horario ocupado por otra
    // prueba; cualquier otro error debe fallar con su motivo real.
    if (!/horario|disponible/i.test(lastError)) break;
  }

  expect(lastError, 'La cita pendiente de prueba debe crearse').toBeTruthy();
  throw new Error(lastError);
}
