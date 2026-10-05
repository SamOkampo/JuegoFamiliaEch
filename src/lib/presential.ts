import { normalizeRoomCode } from "./realtime";

export const HAPTICS_STORAGE_KEY = "jfe:haptics";

export function buildRoomInviteUrl(origin: string, code: string): string {
  const normalizedOrigin = origin.replace(/\/$/, "");
  const normalizedCode = normalizeRoomCode(code);
  return normalizedOrigin + "/online?room=" + encodeURIComponent(normalizedCode);
}

export function buildRoomShareText(code: string): string {
  return "Únete a mi sala " + normalizeRoomCode(code) + " en JuegoFamiliaEch.";
}
