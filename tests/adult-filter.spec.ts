import { expect, test } from "@playwright/test";

test("minor filters never select 18+ prompts and adult selector is explicit", async ({ page }) => {
  await page.goto("/online");
  await page.locator("#create-name").fill("ContentHost");
  await page.getByRole("button", { name: "Crear sala" }).click();
  await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}$/);

  const age = page.getByLabel("Persona más joven");
  const intensity = page.getByLabel("Profundidad máxima");
  await expect(age.locator('option[value="18"]')).toHaveText("Solo adultos (18+)");
  await age.selectOption("16");
  await intensity.selectOption("3");
  await expect(age).toHaveValue("16");
  await expect(page.getByText(/Elige «Solo adultos \(18\+\)» únicamente/)).toBeVisible();

  await age.selectOption("18");
  await expect(age).toHaveValue("18");
  await expect(page.getByText(/preguntas disponibles con estos filtros/)).toBeVisible();
});
