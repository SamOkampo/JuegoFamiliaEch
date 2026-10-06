import { expect, test } from "@playwright/test";

test("PWA manifest exposes install metadata and generated icons", async ({
  request,
}) => {
  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);

  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe("JuegoFamiliaEch");
  expect(manifest.short_name).toBe("JuegoFamilia");
  expect(manifest.start_url).toBe("/online");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        src: "/api/pwa/icon/192",
        sizes: "192x192",
        type: "image/png",
      }),
      expect.objectContaining({
        src: "/api/pwa/icon/512",
        sizes: "512x512",
        type: "image/png",
      }),
    ]),
  );

  const iconResponse = await request.get("/api/pwa/icon/192");
  expect(iconResponse.ok()).toBe(true);
  expect(iconResponse.headers()["content-type"]).toContain("image/png");

  const swResponse = await request.get("/sw.js");
  expect(swResponse.ok()).toBe(true);
  expect(await swResponse.text()).toContain('const CACHE_NAME = "jfe-shell-v1"');
});

test("room session survives refresh and reconnects after network loss", async ({
  page,
  context,
}) => {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();

  await page.goto("/online");
  await page.locator("#create-name").fill("PWA" + suffix);
  await page.getByRole("button", { name: "Crear sala" }).click();

  await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}$/);
  await expect(page.locator(".connectionBadge").filter({ hasText: "Conectado" })).toBeVisible({
    timeout: 15_000,
  });

  const roomUrl = page.url();
  const roomCode = roomUrl.split("/").pop() ?? "";

  await page.reload();

  await expect(page).toHaveURL(roomUrl);
  await expect(
    page.getByRole("button", {
      name: "Copiar código de sala " + roomCode,
    }),
  ).toBeVisible();
  await expect(page.locator(".connectionBadge").filter({ hasText: "Conectado" })).toBeVisible({
    timeout: 15_000,
  });

  await context.setOffline(true);
  await expect(
    page.getByText(/Sin internet\. Conservamos esta pantalla/i),
  ).toBeVisible();

  await context.setOffline(false);
  await expect(page.locator(".connectionBadge").filter({ hasText: "Conectado" })).toBeVisible({
    timeout: 20_000,
  });
});

test("service worker serves the offline fallback", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Offline navigation fallback is asserted once in Chromium; WebKit still runs refresh/reconnect coverage.",
  );

  await page.goto("/online");

  await page.waitForFunction(
    () =>
      "serviceWorker" in navigator &&
      navigator.serviceWorker.controller !== null,
    undefined,
    { timeout: 15_000 },
  );

  await context.setOffline(true);
  try {
    await page.goto("/offline-probe", {
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });

    await expect(
      page.getByRole("heading", {
        name: "La conversación puede seguir. La sincronización espera.",
      }),
    ).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
