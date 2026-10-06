"use client";

import { useEffect, useState } from "react";
import { sendClientTelemetry } from "@/lib/telemetry";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function PwaInstallCard() {
  const [promptEvent, setPromptEvent] =
    useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    function handlePrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    }

    function handleInstalled() {
      setInstalled(true);
      setPromptEvent(null);
      void sendClientTelemetry("pwa_installed");
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setPromptEvent(null);
  }

  if (installed) return null;

  return (
    <section className="pwaInstallCard" aria-label="Instalar la aplicación">
      <div>
        <p className="eyebrow">INSTALAR</p>
        <strong>Ten el juego a un toque, como una app.</strong>
        <p className="muted">
          La instalación guarda la interfaz básica para que puedas abrirla
          incluso con una conexión inestable. Las salas siguen necesitando
          internet para sincronizarse.
        </p>
      </div>

      {promptEvent ? (
        <button type="button" className="button secondary" onClick={install}>
          Instalar JuegoFamiliaEch
        </button>
      ) : (
        <p className="installHint">
          En móvil, usa el menú del navegador y elige “Añadir a pantalla de
          inicio” cuando esa opción esté disponible.
        </p>
      )}
    </section>
  );
}
