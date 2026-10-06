import { expect, test } from "@playwright/test";

test("central display without host-issued token fails safely", async ({ page }) => {
  await page.goto("/display/ABC123");

  await expect(
    page.getByRole("heading", { name: "No pudimos abrir esta sala." }),
  ).toBeVisible();
  await expect(
    page.getByText(/enlace generado por el anfitrión/i),
  ).toBeVisible();

  await expect(page.getByRole("button", { name: /listo/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /iniciar partida/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /revelar pregunta/i })).toHaveCount(0);
});
