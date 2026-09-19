import { expect, test } from "./fixtures";

test("una spesa Ogni mese si ripete nei mesi successivi e si può sospendere", async ({
  page,
}) => {
  // orologio simulato: si registra il 5 giugno e si riapre l'app il 6 agosto
  await page.clock.setFixedTime(new Date(2026, 5, 5, 12, 0));
  await page.goto("./");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Aggiungi spesa" })
    .click();
  const sheet = page.getByRole("dialog", { name: "Nuova spesa" });
  for (const key of ["1", "2", ",", "9", "9"]) {
    await sheet.getByRole("button", { name: key, exact: true }).click();
  }
  await sheet.getByRole("radio", { name: "Abbonamenti" }).click();
  await sheet.getByRole("textbox", { name: "Nota" }).fill("Netflix");
  await sheet.getByRole("button", { name: /^Ripetizione/ }).click();
  await sheet.getByRole("button", { name: "Salva" }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "aggiunti a Abbonamenti · ogni mese" }),
  ).toBeVisible();

  await page.clock.setFixedTime(new Date(2026, 7, 6, 9, 0));
  await page.goto("./#/history?month=all");
  await page.reload();
  const banner = page
    .getByRole("status")
    .filter({ hasText: "Totale filtrato" });
  await expect(banner).toContainText("3 spese");
  await expect(banner).toContainText("38,97 €");

  // riaprire di nuovo non crea duplicati
  await page.reload();
  await expect(banner).toContainText("3 spese");

  // la regola compare in Impostazioni e si sospende
  await page.goto("./#/settings/recurring");
  await expect(
    page.getByRole("button", { name: /Netflix.*Attiva/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Netflix/ }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Sospendi" })
    .click();
  await expect(
    page.getByRole("button", { name: /Netflix.*Sospesa/ }),
  ).toBeVisible();

  // sospesa: il mese dopo non viene creata la spesa
  await page.clock.setFixedTime(new Date(2026, 8, 10, 9, 0));
  await page.goto("./#/history?month=all");
  await page.reload();
  await expect(banner).toContainText("3 spese");
});
