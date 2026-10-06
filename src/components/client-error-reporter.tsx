"use client";

import { useEffect } from "react";
import { sendClientTelemetry } from "@/lib/telemetry";

export function ClientErrorReporter() {
  useEffect(() => {
    const sent = new Set<string>();

    function report(kind: string, event: Parameters<typeof sendClientTelemetry>[0]) {
      if (sent.has(kind)) return;
      sent.add(kind);
      void sendClientTelemetry(event);
    }

    function handleError(event: Event) {
      if (event instanceof ErrorEvent) {
        report("runtime", "client_error_runtime");
      } else {
        report("resource", "client_error_resource");
      }
    }

    function handleUnhandledRejection() {
      report("promise", "client_error_promise");
    }

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
}
