import { expect, test, type Page } from "./fixtures";

async function typeAmount(page: Page, keys: string[]) {
  const sheet = page.getByRole("dialog", { name: "Nuova spesa" });
  for (const key of keys) {
    await sheet.getByRole("button", { name: key, exact: true }).click();
  }
}

test("si aggiunge una spesa in 3 tocchi più l'importo", async ({ page }) => {
  await page.goto("./");

  // tocco 1: "+"
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Aggiungi spesa" })
    .click();
  const sheet = page.getByRole("dialog", { name: "Nuova spesa" });
  await expect(sheet).toBeVisible();

  // importo dal tastierino integrato, con cifre "fantasma"
  await typeAmount(page, ["1", "2", ",", "5"]);
  await expect(sheet.getByTestId("amount-display")).toHaveText("12,50 €");

  // tocco 2: categoria
  await sheet.getByRole("radio", { name: "Ristoranti" }).click();
  await expect(
    sheet.getByRole("radio", { name: "Ristoranti" }),
  ).toHaveAttribute("aria-checked", "true");

  // tocco 3: Salva
  await sheet.getByRole("button", { name: "Salva" }).click();
  await expect(sheet).toBeHidden();
  await expect(
    page.getByRole("status").filter({ hasText: "aggiunti" }),
  ).toHaveText("12,50 € aggiunti a Ristoranti");
});

test("Salva senza categoria non chiude il foglio", async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Aggiungi spesa" })
    .click();
  const sheet = page.getByRole("dialog", { name: "Nuova spesa" });
  await typeAmount(page, ["8"]);
  await sheet.getByRole("button", { name: "Salva" }).click();
  await expect(sheet).toBeVisible();
});

test("chiudere con dati inseriti chiede se scartarli", async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Aggiungi spesa" })
    .click();
  const sheet = page.getByRole("dialog", { name: "Nuova spesa" });
  await typeAmount(page, ["5"]);
  await sheet.getByRole("button", { name: "Annulla" }).click();

  const confirm = page.getByRole("alertdialog", {
    name: "Scartare questa spesa?",
  });
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Scarta" }).click();
  await expect(sheet).toBeHidden();
});

test("scrivendo la nota il tastierino si nasconde e poi torna", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Aggiungi spesa" })
    .click();
  const sheet = page.getByRole("dialog", { name: "Nuova spesa" });
  const key = sheet.getByRole("button", { name: "7", exact: true });
  await expect(key).toBeVisible();

  // con il focus sulla nota resta solo la tastiera del sistema
  await sheet.getByRole("textbox", { name: "Nota" }).click();
  await expect(key).toBeHidden();

  // toccando l'importo la nota perde il focus e il tastierino ricompare
  await sheet.getByTestId("amount-display").click();
  await expect(key).toBeVisible();
  await key.click();
  await expect(sheet.getByTestId("amount-display")).toHaveText("7,00 €");
});

test("in inglese il tastierino usa il punto e il simbolo davanti", async ({
  page,
}) => {
  await page.goto("./#/settings");
  await page.getByRole("radio", { name: "English" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Add expense" })
    .click();
  const sheet = page.getByRole("dialog", { name: "New expense" });
  for (const key of ["4", ".", "2"]) {
    await sheet.getByRole("button", { name: key, exact: true }).click();
  }
  await expect(sheet.getByTestId("amount-display")).toHaveText("€4.20");
});

test("una nota già usata suggerisce la sua categoria", async ({ page }) => {
  await page.goto("./");
  const open = () =>
    page
      .getByRole("navigation")
      .getByRole("button", { name: "Aggiungi spesa" })
      .click();
  await open();
  let sheet = page.getByRole("dialog", { name: "Nuova spesa" });
  await sheet.getByRole("button", { name: "9", exact: true }).click();
  await sheet.getByRole("radio", { name: "Trasporti" }).click();
  await sheet.getByRole("textbox", { name: "Nota" }).fill("Benzina");
  await sheet.getByRole("button", { name: "Salva" }).click();
  await expect(sheet).toBeHidden();

  await open();
  sheet = page.getByRole("dialog", { name: "Nuova spesa" });
  await sheet.getByRole("textbox", { name: "Nota" }).fill("benzina");
  await sheet
    .getByRole("button", { name: "Categoria suggerita: Trasporti" })
    .click();
  await expect(sheet.getByRole("radio", { name: "Trasporti" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});
