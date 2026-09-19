import { expect, test, type Page } from "./fixtures";

async function addExpense(page: Page, keys: string[], category: string) {
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Aggiungi spesa" })
    .click();
  const sheet = page.getByRole("dialog", { name: "Nuova spesa" });
  for (const key of keys) {
    await sheet.getByRole("button", { name: key, exact: true }).click();
  }
  await sheet.getByRole("radio", { name: category }).click();
  await sheet.getByRole("button", { name: "Salva" }).click();
  await expect(sheet).toBeHidden();
}

test.beforeEach(async ({ page }) => {
  await page.goto("./#/charts");
  await addExpense(page, ["3", "0"], "Spesa");
  await addExpense(page, ["1", "0"], "Spesa");
  await addExpense(page, ["6", "0"], "Trasporti");
});

test("i grafici mostrano totale e categorie e portano allo storico filtrato", async ({
  page,
}) => {
  await expect(page.getByText("Totale del mese")).toBeVisible();
  await expect(page.getByText("100,00 €").first()).toBeVisible();

  // legenda: Trasporti 60%, Spesa 40%
  const spesa = page.getByRole("button", { name: /^Spesa, 40%, 40,00 €$/ });
  await expect(
    page.getByRole("button", { name: /^Trasporti, 60%, 60,00 €$/ }),
  ).toBeVisible();
  await spesa.click();
  await expect(spesa).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Vedi Spesa nello storico" }).click();
  await expect(page).toHaveURL(/#\/history\?cat=spesa/);
  // lo stesso importo nello storico filtrato
  await expect(
    page.getByRole("status").filter({ hasText: "Totale filtrato" }),
  ).toContainText("40,00 €");
  await expect(
    page.getByRole("status").filter({ hasText: "Totale filtrato" }),
  ).toContainText("2 spese");
});

test("toccare la barra di oggi mostra l'importo e apre il giorno", async ({
  page,
}) => {
  await page.getByRole("button", { name: /^Oggi · .*: 100,00 €$/ }).click();
  await page.getByRole("button", { name: "Apri giorno" }).click();
  await expect(page).toHaveURL(/#\/history\?day=/);
  await expect(
    page.getByRole("status").filter({ hasText: "Totale filtrato" }),
  ).toContainText("100,00 €");
});
