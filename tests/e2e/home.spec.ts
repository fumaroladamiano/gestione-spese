import { expect, test, type Page } from "@playwright/test";

async function addExpense(page: Page, keys: string[], category: string) {
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /^(Aggiungi spesa|Add expense)$/ })
    .click();
  const sheet = page.getByRole("dialog");
  for (const key of keys) {
    await sheet.getByRole("button", { name: key, exact: true }).click();
  }
  await sheet.getByRole("radio", { name: category }).click();
  await sheet.getByRole("button", { name: /^(Salva|Save)$/ }).click();
  await expect(sheet).toBeHidden();
}

test("la Home mostra il totale del mese, oggi e le ultime spese", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.getByText("Registra la prima spesa")).toBeVisible();

  await addExpense(page, ["1", "2", "3", "4", ",", "5"], "Casa");
  const hero = page.getByRole("link", { name: "Apri i grafici del mese" });
  await expect(hero).toContainText("1.234,50 €");
  await expect(hero).toContainText("Speso a");
  await expect(
    page.getByRole("button", { name: /Casa, Oggi, Carta/ }),
  ).toBeVisible();
});

test("in inglese la Home usa testi, importi e date inglesi, anche dopo il ricaricamento", async ({
  page,
}) => {
  await page.goto("./#/settings");
  await page.getByRole("radio", { name: "English" }).click();
  await page.getByRole("link", { name: "Home" }).click();
  await addExpense(page, ["1", "2", "3", "4", ".", "5"], "Home");

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Expenses");
  const hero = page.getByRole("link", { name: "Open this month's charts" });
  await expect(hero).toContainText("€1,234.50");
  await expect(hero).toContainText("Spent in");
  await expect(
    page.getByText(
      /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) \d+ [A-Z][a-z]+$/,
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Home, Today, Card/ }),
  ).toBeVisible();
});
