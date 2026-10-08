import { buildWhatsAppUrl } from './whatsapp-confirmation';

export interface WhatsAppMessageChannel {
  openConfirmation(phone: string, message: string): string;
}

export class BrowserWhatsAppChannel implements WhatsAppMessageChannel {
  openConfirmation(phone: string, message: string): string {
    const url = buildWhatsAppUrl(phone, message);

    if (typeof window !== 'undefined') {
      // window.open(..., 'noopener') devuelve null aunque la pestana si se abre,
      // lo que produciria un error falso. Se abre sin esa caracteristica para
      // poder detectar un bloqueo real y despues se corta el enlace con el opener.
      const popup = window.open(url, '_blank');

      if (!popup) {
        throw new Error('El navegador bloqueó la ventana de WhatsApp. Permite la apertura para continuar.');
      }

      try {
        popup.opener = null;
      } catch {
        // Algunos navegadores impiden tocar opener: la pestana ya quedo abierta.
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
