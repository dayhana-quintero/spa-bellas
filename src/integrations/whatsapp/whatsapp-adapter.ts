import { buildWhatsAppUrl } from './whatsapp-confirmation';

export interface WhatsAppMessageChannel {
  openConfirmation(phone: string, message: string): string;
}

export class BrowserWhatsAppChannel implements WhatsAppMessageChannel {
  openConfirmation(phone: string, message: string): string {
    const url = buildWhatsAppUrl(phone, message);

    if (typeof window !== 'undefined') {
      const popup = window.open(url, '_blank', 'noopener,noreferrer');

      if (!popup) {
        throw new Error('El navegador bloqueó la ventana de WhatsApp. Permite la apertura para continuar.');
      }
    }

    return url;
  }
}

export function createWhatsAppAdapter(channel: WhatsAppMessageChannel = new BrowserWhatsAppChannel()): WhatsAppMessageChannel {
  return channel;
}

export function openWhatsAppConfirmation(
  phone: string,
  message: string,
  channel: WhatsAppMessageChannel = new BrowserWhatsAppChannel(),
): string {
  return channel.openConfirmation(phone, message);
}
