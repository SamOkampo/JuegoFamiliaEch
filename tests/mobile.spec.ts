import { expect, test } from "@playwright/test";

test("deep link prefills the room code on mobile", async ({ page }) => {
  await page.goto("/online?room=ABC123");

  await expect(page.getByRole("heading", { name: /Cada persona/i })).toBeVisible();
  await expect(page.getByLabel("Código de sala")).toHaveValue("ABC123");
  await expect(page.getByLabel("Tu nombre para entrar")).toBeVisible();
});

test("room deep link without credentials fails safely and stays usable", async ({ page }) => {
  await page.goto("/room/ABC123");

  await expect(
    page.getByRole("heading", { name: "No pudimos reconectarte." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Entrar de nuevo" })).toBeVisible();
});

test("main actions retain mobile-sized tap targets", async ({ page }) => {
  await page.goto("/online");

  const createButton = page.getByRole("button", { name: "Crear sala" });
  const joinButton = page.getByRole("button", { name: "Entrar a la sala" });

  const createBox = await createButton.boundingBox();
  const joinBox = await joinButton.boundingBox();

  expect(createBox?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(joinBox?.height ?? 0).toBeGreaterThanOrEqual(44);
});
