import { buildWhatsAppUrl } from './whatsapp-confirmation';

export function openWhatsAppConfirmation(phone: string, message: string): string {
  return buildWhatsAppUrl(phone, message);
}
