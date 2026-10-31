'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// El evento puede llegar antes de que React hidrate: el script inline del
// layout lo guarda en window y aquí lo recuperamos al montar.
declare global {
  interface Window {
    __bellasInstallPrompt?: BeforeInstallPromptEvent;
  }
}

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Ya instalada (o abierta como app): no ofrecer descarga.
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      window.__bellasInstallPrompt = event as BeforeInstallPromptEvent;
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowHelp(false);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setShowHelp(false);
    };

    // Promesa capturada por el script inline si el evento ya se disparó.
    if (window.__bellasInstallPrompt) {
      setDeferredPrompt(window.__bellasInstallPrompt);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  if (installed) {
    return null;
  }

  async function handleDownload() {
    if (!deferredPrompt) {
      // El navegador no ofreció instalación (IP por http, Safari/Firefox,
      // ventana incógnita…): mostrar instrucciones manuales.
      setShowHelp((value) => !value);
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      window.__bellasInstallPrompt = undefined;
      setShowHelp(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void handleDownload()}
        aria-expanded={showHelp}
        aria-label="Descargar app"
        className="whitespace-nowrap rounded-full border border-line bg-strong px-3 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-strong-fg shadow-sm sm:px-4"
      >
        <span className="sm:hidden">App</span>
        <span className="hidden sm:inline">Descargar app</span>
      </button>

      {showHelp ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-line bg-surface p-4 text-left shadow-lg">
          <p className="text-sm font-semibold text-foreground">Para instalar la app</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-body">
            <li>Chrome en PC: ícono “Instalar” en la barra de direcciones.</li>
            <li>Android: menú ⋮ → Instalar aplicación.</li>
            <li>iPhone: Compartir → Añadir a pantalla de inicio.</li>
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Si no aparece el ícono, abre el sitio desde <strong>localhost</strong> o con{' '}
            <strong>https</strong>: por una IP con <strong>http</strong> el navegador bloquea la
            instalación.
          </p>
        </div>
      ) : null}
    </div>
  );
}
