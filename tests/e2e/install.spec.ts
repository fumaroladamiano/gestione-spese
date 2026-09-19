import { expect, test } from "@playwright/test";

test("al primo accesso da Safari si apre la guida all'installazione", async ({
  page,
}) => {
  await page.goto("./");
  const guide = page.getByRole("dialog", { name: "Installa Spese" });
  await expect(guide).toBeVisible();
  await expect(guide).toContainText("Aggiungi alla schermata Home");
  await guide.getByRole("button", { name: "Ho capito" }).click();
  await expect(guide).toBeHidden();

  // dopo averla chiusa non si riapre da sola, ma resta il banner in Home
  await page.reload();
  await expect(page.getByText("Installa Spese sulla Home")).toBeVisible();
  await page.waitForTimeout(1000);
  await expect(guide).toBeHidden();
  await page.getByText("Installa Spese sulla Home").click();
  await expect(guide).toBeVisible();
});

test("in Impostazioni l'app risulta aperta in Safari con la versione", async ({
  page,
}) => {
  await page.goto("./#/settings");
  await page
    .getByRole("dialog", { name: "Installa Spese" })
    .getByRole("button", { name: "Ho capito" })
    .click();
  await expect(
    page.getByRole("button", { name: /Stato.*Aperta in Safari/ }),
  ).toBeVisible();
  await expect(page.getByText("Versione")).toBeVisible();
});
