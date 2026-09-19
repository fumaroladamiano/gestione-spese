import { expect, test, type Page } from "./fixtures";

/** Primo giorno del mese precedente, in formato YYYY-MM-DD. */
function firstDayOfPreviousMonth(): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${String(date.getFullYear())}-${month}-01`;
}

async function addExpense(
  page: Page,
  keys: string[],
  category: string,
  note: string,
  date?: string,
) {
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Aggiungi spesa" })
    .click();
  const sheet = page.getByRole("dialog", { name: "Nuova spesa" });
  for (const key of keys) {
    await sheet.getByRole("button", { name: key, exact: true }).click();
  }
  await sheet.getByRole("radio", { name: category }).click();
  await sheet.getByRole("textbox", { name: "Nota" }).fill(note);
  if (date) {
    await sheet.getByRole("button", { name: /^Data/ }).click();
    await sheet.getByLabel("Scegli data").fill(date);
  }
  await sheet.getByRole("button", { name: "Salva" }).click();
  await expect(sheet).toBeHidden();
}

const banner = (page: Page) =>
  page.getByRole("status").filter({ hasText: "Totale filtrato" });

test.beforeEach(async ({ page }) => {
  await page.goto("./#/history");
  await addExpense(page, ["2", "0", ",", "9"], "Spesa", "Esselunga");
  await addExpense(page, ["1", "2", "3", "4"], "Casa", "Divano");
  await addExpense(page, ["5"], "Spesa", "Coop", firstDayOfPreviousMonth());
});

test("filtra per categoria e mese e mostra il totale giusto", async ({
  page,
}) => {
  // predefinito: mese corrente
  await expect(banner(page)).toContainText("1.254,90 €");
  await expect(banner(page)).toContainText("2 spese");

  await page.getByRole("button", { name: "Categorie" }).click();
  const sheet = page.getByRole("dialog", { name: "Filtri" });
  await sheet.getByRole("button", { name: "Spesa", exact: true }).click();
  await expect(sheet.getByRole("button", { name: /^Mostra/ })).toHaveText(
    "Mostra 1 spesa · 20,90 €",
  );

  // tutti i mesi: si aggiunge la spesa del mese scorso
  await sheet.getByRole("switch", { name: "Tutti i mesi" }).click();
  await expect(sheet.getByRole("button", { name: /^Mostra/ })).toHaveText(
    "Mostra 2 spese · 25,90 €",
  );
  await sheet.getByRole("button", { name: /^Mostra/ }).click();
  await expect(sheet).toBeHidden();

  await expect(banner(page)).toContainText("25,90 €");
  await expect(page).toHaveURL(/month=all/);
  await expect(page).toHaveURL(/cat=spesa/);
  await expect(page.getByRole("button", { name: /Divano/ })).toHaveCount(0);

  // i filtri restano dopo il ricaricamento (sono nell'indirizzo)
  await page.reload();
  await expect(banner(page)).toContainText("25,90 €");

  // Azzera torna al mese corrente senza filtri
  await page.getByRole("button", { name: "Azzera" }).click();
  await expect(banner(page)).toContainText("1.254,90 €");
});

test("la ricerca nelle note ignora maiuscole e accenti", async ({ page }) => {
  await page.getByRole("button", { name: "Giorno" }).click();
  const sheet = page.getByRole("dialog", { name: "Filtri" });
  await sheet.getByRole("switch", { name: "Tutti i mesi" }).click();
  await sheet.getByRole("searchbox", { name: "Cerca nelle note" }).fill("COOP");
  await sheet.getByRole("button", { name: /^Mostra/ }).click();

  await expect(banner(page)).toContainText("5,00 €");
  await expect(page.getByRole("button", { name: /Coop/ })).toBeVisible();

  // il chip della ricerca la toglie con un tocco
  await page.getByRole("button", { name: "Togli la ricerca" }).click();
  await expect(banner(page)).toContainText("1.259,90 €");
});

test("senza risultati propone di azzerare i filtri", async ({ page }) => {
  await page.getByRole("button", { name: "Categorie" }).click();
  const sheet = page.getByRole("dialog", { name: "Filtri" });
  await sheet.getByRole("button", { name: "Svago", exact: true }).click();
  await sheet.getByRole("button", { name: /^Mostra/ }).click();

  await expect(
    page.getByText("Nessuna spesa corrisponde a questi filtri."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Azzera filtri" }).click();
  await expect(banner(page)).toContainText("2 spese");
});
