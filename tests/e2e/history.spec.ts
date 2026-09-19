import { expect, test, type Page } from "./fixtures";

/** Aggiunge una spesa dal foglio: importo come tasti del tastierino, poi categoria e nota. */
async function addExpense(
  page: Page,
  keys: string[],
  category: string,
  note: string,
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
  await sheet.getByRole("button", { name: "Salva" }).click();
  await expect(sheet).toBeHidden();
}

test.beforeEach(async ({ page }) => {
  await page.goto("./#/history");
  await addExpense(page, ["2", "0", ",", "9"], "Spesa", "Esselunga");
  await addExpense(page, ["6", "0"], "Trasporti", "Benzina");
});

test("lo storico raggruppa le spese per giorno con il totale", async ({
  page,
}) => {
  await expect(page.getByRole("heading", { level: 2 }).first()).toContainText(
    "Oggi",
  );
  await expect(page.getByRole("heading", { level: 2 }).first()).toContainText(
    "80,90 €",
  );
  await expect(page.getByRole("button", { name: /Benzina/ })).toBeVisible();
});

test("swipe lungo elimina la spesa e Annulla la ripristina", async ({
  page,
}) => {
  const row = page.getByRole("button", { name: /Esselunga/ });
  const box = await row.boundingBox();
  if (!box) throw new Error("riga non visibile");
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width - 20, y);
  await page.mouse.down();
  for (let step = 1; step <= 12; step++) {
    await page.mouse.move(box.x + box.width - 20 - step * 26, y);
    await page.waitForTimeout(30);
  }
  await page.mouse.up();

  await expect(page.getByRole("button", { name: /Esselunga/ })).toHaveCount(0);
  const toast = page.getByRole("status").filter({ hasText: "Spesa eliminata" });
  await expect(toast).toBeVisible();
  await toast.getByRole("button", { name: "Annulla" }).click();

  await expect(page.getByRole("button", { name: /Esselunga/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 }).first()).toContainText(
    "80,90 €",
  );
});

test("toccare una riga apre la modifica, da cui si può eliminare", async ({
  page,
}) => {
  await page.getByRole("button", { name: /Benzina/ }).click();
  const sheet = page.getByRole("dialog", { name: "Modifica spesa" });
  await expect(sheet.getByTestId("amount-display")).toHaveText("60,00 €");
  await sheet.getByRole("button", { name: "Elimina spesa" }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByRole("button", { name: /Benzina/ })).toHaveCount(0);
  await expect(
    page.getByRole("status").filter({ hasText: "Spesa eliminata" }),
  ).toBeVisible();
});

test("mezzo swipe mostra Modifica ed Elimina senza aprire la modifica", async ({
  page,
}) => {
  const row = page.getByRole("button", { name: /Esselunga/ });
  const box = await row.boundingBox();
  if (!box) throw new Error("riga non visibile");
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width - 20, y);
  await page.mouse.down();
  for (let step = 1; step <= 6; step++) {
    await page.mouse.move(box.x + box.width - 20 - step * 25, y);
    // un dito vero si muove in più fotogrammi: senza pause il gesto non parte
    await page.waitForTimeout(30);
  }
  await page.mouse.up();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  const edit = page.getByRole("button", { name: "Modifica", exact: true });
  await expect(edit).toBeVisible();
  await edit.click();
  await expect(
    page.getByRole("dialog", { name: "Modifica spesa" }),
  ).toBeVisible();
});
