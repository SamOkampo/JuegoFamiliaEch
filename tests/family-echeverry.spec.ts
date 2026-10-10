import { expect, test } from "@playwright/test";

test("host can choose Echeverry mode and never sees deck totals", async ({ page }) => {
  await page.goto("/online");
  const family = page.getByRole("radio", { name: /Familia Echeverry/ });
  await family.check();
  await expect(family).toBeChecked();
  await page.locator("#create-name").fill("FamiliaHost");
  await page.getByRole("button", { name: "Crear sala" }).click();
  await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}$/);

  await expect(page.getByText("Familia Echeverry", { exact: false }).first()).toBeVisible();
  const controls = page.getByRole("region", { name: "Configurar preguntas" });
  await expect(controls).toContainText("Historias, chismes sanos y primeros amores");
  await expect(controls).not.toContainText(/preguntas disponibles/);
  await expect(controls).not.toContainText("50");
  await expect(controls).not.toContainText("210 preguntas");
  await expect(page.getByText("Modo familiar 💛")).toBeVisible();
});

test("regular game creation stays available by default", async ({ page }) => {
  await page.goto("/online");
  await expect(page.getByRole("radio", { name: /Juego para todos/ })).toBeChecked();
});
