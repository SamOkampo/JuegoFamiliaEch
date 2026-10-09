import assert from "node:assert/strict";

const base = (
  process.env.PRODUCTION_WEB_URL ??
  "https://juego-familia-ech-web.socampoecheverry.workers.dev"
).replace(/\/$/, "");

async function check(path, { expectedType, contains, maxAttempts = 4 } = {}) {
  let response;
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      response = await fetch(base + path, {
        signal: AbortSignal.timeout(15000),
        headers: { "user-agent": "JuegoFamiliaEch Production Smoke/1.0" },
      });
      if (response.status === 200) break;
      lastError = new Error("Unexpected HTTP status " + response.status);
    } catch (error) {
      lastError = error;
    }

    if (attempt < maxAttempts - 1) {
      console.log("Waiting for production rollout:", path, lastError?.message);
      await new Promise((resolve) => setTimeout(resolve, 6000));
    }
  }

  assert.ok(response, path + ": no HTTP response: " + lastError);
  assert.equal(response.status, 200, path + ": expected HTTP 200");
  const type = response.headers.get("content-type") ?? "";
  if (expectedType) {
    assert.ok(type.includes(expectedType), path + ": unexpected content-type " + type);
  }
  assert.equal(
    response.headers.get("x-content-type-options"),
    "nosniff",
    path + ": missing security header",
  );
  const buffer = Buffer.from(await response.arrayBuffer());
  if (contains) {
    assert.ok(
      buffer.toString("utf8").includes(contains),
      path + ": expected content " + JSON.stringify(contains),
    );
  }
  console.log("PASS", response.status, path, type, buffer.byteLength);
  return buffer;
}

await check("/", { expectedType: "text/html", contains: "JuegoFamiliaEch", maxAttempts: 25 });
await check("/online", { expectedType: "text/html", contains: "Cada persona" });
await check("/privacy", { expectedType: "text/html", contains: "PRIVACIDAD" });
await check("/terms", { expectedType: "text/html", contains: "TÉRMINOS" });
await check("/offline", { expectedType: "text/html", contains: "MODO SIN CONEXIÓN" });
await check("/sw.js", { expectedType: "javascript", contains: "jfe-shell-v1" });

const manifestBytes = await check("/manifest.webmanifest");
const manifest = JSON.parse(manifestBytes.toString("utf8"));
assert.equal(manifest.name, "JuegoFamiliaEch");
assert.equal(manifest.start_url, "/online");

const icon = await check("/api/pwa/icon/192", { expectedType: "image/png" });
assert.equal(icon.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");

console.log("All production HTTP/PWA smoke checks passed:", base);
