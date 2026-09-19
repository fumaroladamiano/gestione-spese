import { expect, test } from "./fixtures";

test("si crea, usa, archivia, ripristina ed elimina una categoria", async ({
  page,
}) => {
  await page.goto("./#/settings");
  await page.getByRole("button", { name: /^Categorie/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Categorie");

  // nuova categoria
  await page.getByRole("button", { name: "Nuova categoria" }).first().click();
  const sheet = page.getByRole("dialog", { name: "Nuova categoria" });
  await sheet.getByRole("textbox", { name: "Nome" }).fill("Palestra");
  await sheet.getByRole("radio", { name: "Icona 12" }).click();
  await sheet.getByRole("button", { name: "Salva" }).click();
  await expect(sheet).toBeHidden();
  await expect(
    page.getByRole("status").filter({ hasText: "Categoria “Palestra” creata" }),
  ).toBeVisible();

  // un nome già usato (anche tradotto) viene rifiutato
  await page.getByRole("button", { name: "Nuova categoria" }).first().click();
  const duplicate = page.getByRole("dialog", { name: "Nuova categoria" });
  await duplicate.getByRole("textbox", { name: "Nome" }).fill("groceries");
  await duplicate.getByRole("button", { name: "Salva" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Esiste già una categoria" }),
  ).toBeVisible();
  await duplicate.getByRole("button", { name: "Annulla" }).click();

  // la nuova categoria compare nel foglio spesa
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Aggiungi spesa" })
    .click();
  const expense = page.getByRole("dialog", { name: "Nuova spesa" });
  await expense.getByRole("button", { name: "4", exact: true }).click();
  await expense.getByRole("radio", { name: "Palestra" }).click();
  await expense.getByRole("button", { name: "Salva" }).click();
  await expect(expense).toBeHidden();

  // con una spesa si archivia (non si elimina)
  await page.getByRole("button", { name: /^Palestra.*1 spesa/ }).click();
  const edit = page.getByRole("dialog", { name: "Modifica categoria" });
  await expect(edit).toContainText("La spesa esistente resta nello storico.");
  await edit.getByRole("button", { name: "Archivia categoria" }).click();
  await expect(page.getByRole("heading", { name: "Archiviate" })).toBeVisible();

  // archiviata: non compare più nel foglio spesa
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Aggiungi spesa" })
    .click();
  await expect(
    page
      .getByRole("dialog", { name: "Nuova spesa" })
      .getByRole("radio", { name: "Palestra" }),
  ).toHaveCount(0);
  await page
    .getByRole("dialog", { name: "Nuova spesa" })
    .getByRole("button", { name: "Annulla" })
    .click();

  // ripristino
  await page.getByRole("button", { name: /^Palestra/ }).click();
  await page
    .getByRole("dialog", { name: "Modifica categoria" })
    .getByRole("button", { name: "Ripristina categoria" })
    .click();
  await expect(page.getByRole("heading", { name: "Archiviate" })).toHaveCount(
    0,
  );

  // una categoria senza spese si elimina
  await page.getByRole("button", { name: "Nuova categoria" }).first().click();
  const empty = page.getByRole("dialog", { name: "Nuova categoria" });
  await empty.getByRole("textbox", { name: "Nome" }).fill("Vuota");
  await empty.getByRole("button", { name: "Salva" }).click();
  await page.getByRole("button", { name: /^Vuota/ }).click();
  await page
    .getByRole("dialog", { name: "Modifica categoria" })
    .getByRole("button", { name: "Elimina categoria" })
    .click();
  await expect(page.getByRole("button", { name: /^Vuota/ })).toHaveCount(0);
});

test("Altro non si può archiviare", async ({ page }) => {
  await page.goto("./#/settings/categories");
  await page.getByRole("button", { name: /^Altro/ }).click();
  const sheet = page.getByRole("dialog", { name: "Modifica categoria" });
  await expect(sheet).toContainText("“Altro” non si può archiviare");
  await expect(
    sheet.getByRole("button", { name: "Archivia categoria" }),
  ).toHaveCount(0);
});
