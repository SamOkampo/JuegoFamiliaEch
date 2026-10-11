import { expect, test } from "@playwright/test";

test("join QR appears for host and presentation only before the game begins", async ({ page, browser }) => {
  await page.goto("/online");
  await page.locator("#create-name").fill("HostQR");
  await page.getByRole("button", { name: "Crear sala" }).click();
  await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}$/);

  const code = new URL(page.url()).pathname.split("/").pop()!;
  const hostInvite = page.getByRole("region", { name: "Invitar personas" });
  const hostQr = hostInvite.getByRole("img", {
    name: "Código QR para entrar a la sala " + code,
  });

  await expect(hostQr).toBeVisible();
  await expect(hostQr).toHaveAttribute("src", /^data:image\/png;base64,/);
  await expect(hostInvite.getByText(/Escanea|escanearlo/i)).toBeVisible();

  await page.getByRole("button", { name: "Preparar pantalla central" }).click();
  const displayLink = page.getByRole("link", { name: "Abrir pantalla" });
  await expect(displayLink).toHaveAttribute("href", /\/display\//);

  const displayHref = await displayLink.getAttribute("href");
  expect(displayHref).toBeTruthy();
  const presentation = await page.context().newPage();
  await presentation.goto(displayHref!);
  await expect(presentation.getByRole("img", {
    name: "Escanea para entrar a la sala " + code,
  })).toBeVisible();

  const presentationQr = presentation.locator(".displayJoinQr img");
  await expect(presentationQr).toHaveAttribute("src", /^data:image\/png;base64,/);
  await expect(presentation.getByText("Escanea para entrar", { exact: true })).toBeVisible();

  const guestContext = await browser.newContext();
  try {
    const guest = await guestContext.newPage();
    await guest.goto("/online?room=" + code);
    await guest.locator("#join-name").fill("InvitadaQR");
    await guest.getByRole("button", { name: "Entrar a la sala" }).click();
    await expect(guest).toHaveURL(/\/room\/[A-Z0-9]{6}$/);
    await expect(page.getByText("InvitadaQR", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Estoy listo" }).click();
    await guest.getByRole("button", { name: "Estoy listo" }).click();

    const start = page.getByRole("button", { name: "Iniciar partida" });
    await expect(start).toBeEnabled({ timeout: 15000 });
    await start.click();

    await expect(page.locator(".qrWrap img")).toHaveCount(0);
    await expect(presentation.locator(".displayJoinQr img")).toHaveCount(0);
    await expect(presentation.locator(".displayGame")).toBeVisible();
  } finally {
    await guestContext.close();
    await presentation.close();
  }
});
