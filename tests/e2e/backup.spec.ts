import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "./fixtures";

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

/** Esporta dalle Impostazioni con "Scarica file" e restituisce il percorso del file scaricato. */
async function exportFile(
  page: Page,
  row: string,
  downloadLabel = "Scarica file",
): Promise<{ path: string; name: string }> {
  await page.getByRole("button", { name: row }).click();
  const sheet = page.getByRole("alertdialog");
  const downloadPromise = page.waitForEvent("download");
  await sheet.getByRole("button", { name: downloadLabel }).click();
  const download = await downloadPromise;
  return { path: await download.path(), name: download.suggestedFilename() };
}

test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await addExpense(page, ["2", "0", ",", "9"], "Spesa", "Esselunga");
  await addExpense(page, ["1", "2", "3", "4"], "Casa", 'Divano "grande"');
  await page.getByRole("link", { name: "Impostazioni" }).click();
});

test("esporta un backup JSON e lo reimporta con Sostituisci tutto", async ({
  page,
}) => {
  await expect(page.getByRole("button", { name: /Ultimo backup/ })).toHaveCount(
    0,
  );
  const backup = await exportFile(page, "Esporta backup (JSON)");
  expect(backup.name).toMatch(/^spese-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const json: unknown = JSON.parse(await readFile(backup.path, "utf8"));
  expect(json).toMatchObject({ app: "spese", schemaVersion: 1 });
  await expect(page.getByText("Ultimo backup")).toBeVisible();

  // cambia i dati: elimina una spesa dallo storico
  await page.getByRole("link", { name: "Storico" }).click();
  await page.getByRole("button", { name: /Esselunga/ }).click();
  await page.getByRole("button", { name: "Elimina spesa" }).click();
  await expect(page.getByRole("button", { name: /Esselunga/ })).toHaveCount(0);

  // reimporta il file
  await page.getByRole("link", { name: "Impostazioni" }).click();
  await page.getByTestId("import-input").setInputFiles(backup.path);
  const choice = page.getByRole("alertdialog", { name: "Importa backup" });
  await expect(choice).toContainText("2 spese");
  await choice.getByRole("button", { name: "Sostituisci tutto" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Ripristinate 2 spese" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Storico" }).click();
  await expect(page.getByRole("button", { name: /Esselunga/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Divano/ })).toBeVisible();
});

test("Unisci non duplica le spese già presenti", async ({ page }) => {
  const backup = await exportFile(page, "Esporta backup (JSON)");
  await page.getByTestId("import-input").setInputFiles(backup.path);
  await page
    .getByRole("alertdialog", { name: "Importa backup" })
    .getByRole("button", { name: "Unisci ai dati attuali" })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Nessuna spesa nuova da aggiungere" }),
  ).toBeVisible();
});

test("un file non valido non modifica nulla", async ({ page }) => {
  await page.getByTestId("import-input").setInputFiles({
    name: "altro.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"app":"altro"}'),
  });
  await expect(
    page.getByRole("status").filter({ hasText: "File non valido" }),
  ).toBeVisible();
});

test("il CSV per Excel è in formato italiano anche con l'app in inglese", async ({
  page,
}) => {
  await page.getByRole("radio", { name: "English" }).click();
  const csv = await exportFile(page, "Export for Excel (CSV)", "Download file");
  expect(csv.name).toMatch(/^spese-[0-9-]{10}[.]csv$/);
  const raw = await readFile(csv.path, "utf8");
  // il file inizia con il BOM, che fa riconoscere l'UTF-8 a Excel
  expect(raw.charCodeAt(0)).toBe(0xfeff);
  const lines = raw.slice(1).trimEnd().split(/\r?\n/);
  expect(lines[0]).toBe(
    "data;categoria;importo_eur;descrizione;metodo;ricorrente",
  );
  expect(raw).toContain(';Casa;1234,00;"Divano ""grande""";Carta;no');
  expect(raw).toContain(";Spesa;20,90;Esselunga;Carta;no");
});
