import { expect, test } from "@playwright/test";

test("host can configure all five surprise modes from mobile lobby", async ({ page }) => {
  await page.goto("/online");
  await page.locator("#create-name").fill("SurpriseHost");
  await page.getByRole("button", { name: "Crear sala" }).click();
  await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}$/);

  const section = page.getByRole("region", { name: "Rondas especiales" });
  await expect(section).toBeVisible();
  await expect(section.getByRole("checkbox")).toHaveCount(5);

  for (const label of [
    "¿Quién es más probable?",
    "Todos responden",
    "Reto sorpresa",
    "Recuerdo en cadena",
    "Carta dorada",
  ]) {
    await expect(section.getByRole("checkbox", { name: label })).toBeChecked();
  }

  const frequency = section.getByLabel("Frecuencia");
  await expect(frequency).toHaveValue("3");
  await frequency.selectOption("0");
  await expect(frequency).toHaveValue("0");
  await frequency.selectOption("3");
  await expect(frequency).toHaveValue("3");

  await section.getByRole("checkbox", { name: "Reto sorpresa" }).uncheck();
  await expect(
    section.getByRole("checkbox", { name: "Reto sorpresa" }),
  ).not.toBeChecked();

  await page.emulateMedia({ reducedMotion: "reduce" });
  const animationName = await section.evaluate(
    (element) => getComputedStyle(element).animationName,
  );
  expect(animationName).toBe("none");
});
