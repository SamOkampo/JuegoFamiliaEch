import { expect, test } from "@playwright/test";

test("quick tutorial walks through three steps and is remembered locally", async ({ page }) => {
  await page.goto("/online");
  const guide = page.getByRole("region", { name: "Guía para jugar" });
  await expect(guide).toBeVisible();
  await expect(guide.getByRole("heading", { name: "Armen el parche" })).toBeVisible();

  await guide.getByRole("button", { name: "Siguiente paso" }).click();
  await expect(guide.getByRole("heading", { name: "Échenle ojo a la pregunta" })).toBeVisible();
  await guide.getByRole("button", { name: "Siguiente paso" }).click();
  await expect(guide.getByRole("heading", { name: "¡A echar cuento sin afán!" })).toBeVisible();

  await guide.getByRole("button", { name: "¡Entendido!" }).click();
  await expect(guide.getByRole("heading", { name: "¡A echar cuento sin afán!" })).toHaveCount(0);

  await page.reload();
  await expect(guide.getByRole("button", { name: "Ver cómo jugar" })).toBeVisible();

  await guide.getByRole("button", { name: "Ver cómo jugar" }).click();
  await expect(guide.getByRole("heading", { name: "Armen el parche" })).toBeVisible();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(
    () => guide.locator(".quickTourStep").evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
});

test("the quick tour never blocks room entry", async ({ page }) => {
  await page.goto("/online");
  await page.locator("#create-name").fill("PremiumHost");
  await page.getByRole("button", { name: "Crear sala" }).click();
  await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}$/);
  await expect(page.getByRole("heading", { name: /Hola, PremiumHost/i })).toBeVisible({ timeout: 15000 });
});
