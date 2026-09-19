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

test("il budget compare in Home e nei Grafici e segnala lo sforamento", async ({
  page,
}) => {
  await page.goto("./#/settings");
  const field = page.getByLabel("Budget mensile");
  await field.fill("100");
  await field.press("Enter");
  await expect(
    page.getByRole("status").filter({ hasText: "Budget impostato a 100 €" }),
  ).toBeVisible();
  await expect(field).toHaveValue("100,00");

  await page.getByRole("link", { name: "Home" }).click();
  await addExpense(page, ["4", "0"], "Spesa");
  const hero = page.getByRole("link", { name: "Apri i grafici del mese" });
  await expect(hero).toContainText("40% di 100 €");
  await expect(hero).toContainText("Restano 60,00 €");

  await addExpense(page, ["8", "0"], "Casa");
  await expect(hero).toContainText("Sforato di 20,00 €");

  await hero.click();
  await expect(
    page.getByText(/Proiezione a fine mese: .* — oltre il budget/),
  ).toBeVisible();

  // svuotare il campo toglie il budget
  await page.getByRole("link", { name: "Impostazioni" }).click();
  await field.fill("");
  await field.press("Enter");
  await expect(
    page.getByRole("status").filter({ hasText: "Budget disattivato" }),
  ).toBeVisible();
});
