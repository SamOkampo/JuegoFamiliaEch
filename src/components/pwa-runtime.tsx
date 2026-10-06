"use client";

import { useEffect, useRef, useState } from "react";

export function PwaRuntime() {
  const [online, setOnline] = useState(true);
  const [recovered, setRecovered] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    setOnline(navigator.onLine);

    function handleOnline() {
      setOnline(true);
      if (wasOffline.current) {
        setRecovered(true);
        window.setTimeout(() => setRecovered(false), 3000);
      }
      wasOffline.current = false;
    }

    function handleOffline() {
      wasOffline.current = true;
      setRecovered(false);
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      void navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!online) {
    return (
      <div className="networkNotice offline" role="status" aria-live="polite">
        Sin internet. Conservamos esta pantalla y reconectaremos la sala
        automáticamente cuando vuelva la conexión.
      </div>
    );
  }

  if (recovered) {
    return (
      <div className="networkNotice recovered" role="status" aria-live="polite">
        Conexión recuperada. Sincronizando la sala…
      </div>
    );
  }

  return null;
}
