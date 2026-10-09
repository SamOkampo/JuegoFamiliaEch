import { expect, test } from "@playwright/test";

test("arrival motion is visible in normal mode and disabled when motion is reduced", async ({
  page,
}) => {
  await page.goto("/online");

  const title = page.getByRole("heading", {
    name: "Cada persona, su teléfono. Una sola conversación.",
  });
  await expect(title).toBeVisible();

  const normalAnimation = await title.evaluate(
    (element) => getComputedStyle(element).animationName,
  );
  expect(normalAnimation).toContain("jfe-rise");

  await page.emulateMedia({ reducedMotion: "reduce" });

  await expect.poll(
    () => title.evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");

  await expect.poll(
    () =>
      page.locator(".onlineCard").first().evaluate(
        (element) => getComputedStyle(element).animationName,
      ),
  ).toBe("none");

  await expect(page.getByRole("button", { name: "Crear sala" })).toBeVisible();
});

test("question reveal has a distinct animated state without changing gameplay", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel("Nombre del jugador").fill("Ana");
  await page.getByRole("button", { name: "Añadir" }).click();
  await page.getByLabel("Nombre del jugador").fill("Luis");
  await page.getByRole("button", { name: "Añadir" }).click();

  await page.getByRole("button", { name: "Comenzar ronda" }).click();

  const hiddenCard = page.locator(".questionCard");
  await expect(hiddenCard).toBeVisible();
  await expect(hiddenCard).not.toHaveClass(/revealed/);

  await page.getByRole("button", { name: "Revelar pregunta" }).click();

  const revealedCard = page.locator(".questionCard.revealed");
  await expect(revealedCard).toBeVisible();
  await expect(
    revealedCard.getByText(/Ahora dejen el teléfono/i),
  ).toBeVisible();

  const animation = await revealedCard.evaluate(
    (element) => getComputedStyle(element).animationName,
  );
  expect(animation).toContain("jfe-card-in");

  await page.getByRole("button", { name: "Siguiente persona" }).click();
  await expect(page.locator(".questionCard")).not.toHaveClass(/revealed/);
  await expect(page.getByText("Luis", { exact: true })).toBeVisible();
});
