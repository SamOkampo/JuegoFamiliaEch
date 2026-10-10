export const MAX_JSON_BODY_BYTES = 4096;
export const MAX_WS_MESSAGE_BYTES = 2048;
export const PLAYER_NAME_MAX_LENGTH = 24;
export const QUESTION_COUNT = 160;
export const DECK_VERSION = "core-v2-160";
export const GROUP_TYPES = ["family", "friends", "couple", "mixed"];
export const AGE_BANDS = [8, 12, 16];
export const INTENSITIES = [1, 2, 3];
export const REACTION_TYPES = ["heart", "laugh", "clap", "wow"];
export const SPECIAL_KINDS = ["likely", "everyone", "challenge", "chain", "gold"];

const FORBIDDEN_NAME_CHARS =
  /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/u;

export function validatePlayerName(value) {
  if (typeof value !== "string") {
    return { ok: false, error: "INVALID_NAME" };
  }

  const normalized = value
    .normalize("NFC")
    .trim()
    .replace(/\s+/gu, " ");

  if (
    normalized.length === 0 ||
    normalized.length > PLAYER_NAME_MAX_LENGTH ||
    FORBIDDEN_NAME_CHARS.test(normalized) ||
    !/[\p{L}\p{N}]/u.test(normalized)
  ) {
    return { ok: false, error: "INVALID_NAME" };
  }

  return { ok: true, value: normalized };
}

export function isUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

export function isOpaqueToken(value) {
  return (
    typeof value === "string" &&
    /^[A-Za-z0-9_-]{32}$/.test(value)
  );
}

export function validateQuestionPool(value) {
  if (!Array.isArray(value)) return null;
  if (value.length < 2 || value.length > QUESTION_COUNT) return null;
  if (
    value.some(
      (index) =>
        !Number.isInteger(index) ||
        index < 0 ||
        index >= QUESTION_COUNT,
    )
  ) {
    return null;
  }

  const unique = new Set(value);
  if (unique.size !== value.length) return null;
  return [...value];
}

export function validateRoomSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return (
    GROUP_TYPES.includes(value.groupType) &&
    AGE_BANDS.includes(Number(value.youngestAge)) &&
    INTENSITIES.includes(Number(value.maxIntensity)) &&
    (value.specialEvery === undefined || [0, 3].includes(value.specialEvery)) &&
    (value.specialModes === undefined ||
      (Array.isArray(value.specialModes) &&
        value.specialModes.length <= 5 &&
        new Set(value.specialModes).size === value.specialModes.length &&
        value.specialModes.every((kind) => SPECIAL_KINDS.includes(kind))))
  );
}

function validTurn(value) {
  return Number.isInteger(value) && value >= 1 && value <= 10000;
}

export function validateClientEvent(event) {
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return { ok: false, error: "INVALID_MESSAGE" };
  }

  switch (event.type) {
    case "sync":
    case "display-token":
    case "finish":
    case "play-again":
    case "leave":
      return { ok: true };

    case "special-now":
      return SPECIAL_KINDS.includes(event.kind) && validTurn(event.expectedTurnNumber)
        ? { ok: true }
        : { ok: false, error: "INVALID_SPECIAL" };

    case "ready":
      return typeof event.ready === "boolean"
        ? { ok: true }
        : { ok: false, error: "INVALID_MESSAGE" };

    case "settings":
      return validateRoomSettings(event.settings)
        ? { ok: true }
        : { ok: false, error: "INVALID_SETTINGS" };

    case "start":
      if (event.deckVersion !== DECK_VERSION) {
        return { ok: false, error: "DECK_VERSION_MISMATCH" };
      }
      return validateQuestionPool(event.questionPool)
        ? { ok: true }
        : { ok: false, error: "INVALID_QUESTION_POOL" };

    case "reveal":
    case "skip-question":
    case "next-turn":
    case "special-now":
    case "special-reveal":
    case "special-contribute":
      return validTurn(event.expectedTurnNumber)
        ? { ok: true }
        : { ok: false, error: "STALE_TURN" };

    case "special-vote":
      if (!validTurn(event.expectedTurnNumber)) {
        return { ok: false, error: "STALE_TURN" };
      }
      return typeof event.choice === "string" &&
        /^[A-Za-z0-9_-]{1,40}$/.test(event.choice)
        ? { ok: true }
        : { ok: false, error: "INVALID_SPECIAL_VOTE" };

    case "react":
      if (!validTurn(event.expectedTurnNumber)) {
        return { ok: false, error: "STALE_TURN" };
      }
      return event.reaction === null ||
        REACTION_TYPES.includes(event.reaction)
        ? { ok: true }
        : { ok: false, error: "INVALID_REACTION" };

    case "save-moment":
      if (!validTurn(event.expectedTurnNumber)) {
        return { ok: false, error: "STALE_TURN" };
      }
      return typeof event.saved === "boolean"
        ? { ok: true }
        : { ok: false, error: "INVALID_MESSAGE" };

    default:
      return { ok: false, error: "UNSUPPORTED_MESSAGE" };
  }
}

export async function readJsonObject(request) {
  const contentType = (
    request.headers.get("content-type") ?? ""
  )
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    return {
      ok: false,
      error: "UNSUPPORTED_MEDIA_TYPE",
      status: 415,
    };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_JSON_BODY_BYTES
  ) {
    return {
      ok: false,
      error: "REQUEST_TOO_LARGE",
      status: 413,
    };
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BODY_BYTES) {
    return {
      ok: false,
      error: "REQUEST_TOO_LARGE",
      status: 413,
    };
  }

  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("not object");
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "INVALID_JSON", status: 400 };
  }
}

export function consumeFixedWindow(
  previous,
  now,
  limit,
  windowMs,
) {
  const validPrevious =
    previous &&
    Number.isFinite(previous.startedAt) &&
    Number.isInteger(previous.count);

  if (
    !validPrevious ||
    now < previous.startedAt ||
    now - previous.startedAt >= windowMs
  ) {
    return {
      allowed: true,
      retryAfterMs: 0,
      state: { startedAt: now, count: 1 },
    };
  }

  const nextCount = previous.count + 1;
  const allowed = nextCount <= limit;
  return {
    allowed,
    retryAfterMs: allowed
      ? 0
      : Math.max(1, windowMs - (now - previous.startedAt)),
    state: {
      startedAt: previous.startedAt,
      count: nextCount,
    },
  };
}
