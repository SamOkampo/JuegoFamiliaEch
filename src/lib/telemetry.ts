import { GAME_API_URL } from "./realtime";

export type ClientTelemetryEvent =
  | "client_error_runtime"
  | "client_error_promise"
  | "client_error_resource"
  | "pwa_installed";

export type ClientTelemetrySurface =
  | "home"
  | "online"
  | "room"
  | "display"
  | "offline"
  | "privacy"
  | "terms"
  | "other";

export function telemetrySurface(pathname: string): ClientTelemetrySurface {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/online")) return "online";
  if (pathname.startsWith("/room/")) return "room";
  if (pathname.startsWith("/display/")) return "display";
  if (pathname.startsWith("/offline")) return "offline";
  if (pathname.startsWith("/privacy")) return "privacy";
  if (pathname.startsWith("/terms")) return "terms";
  return "other";
}

export async function sendClientTelemetry(
  event: ClientTelemetryEvent,
): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    await fetch(GAME_API_URL + "/api/telemetry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event,
        surface: telemetrySurface(window.location.pathname),
      }),
      keepalive: true,
      cache: "no-store",
    });
  } catch {
    // Telemetry is deliberately best-effort and must never affect the product.
  }
}
