import { expect, test } from "@playwright/test";

test("l'app si apre in italiano all'indirizzo di GitHub Pages", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page).toHaveTitle("Spese");
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Spese");
});

test("la tab bar porta alle quattro sezioni", async ({ page }) => {
  await page.goto("./");
  const nav = page.getByRole("navigation", { name: "Navigazione principale" });

  await nav.getByRole("link", { name: "Storico" }).click();
  await expect(page).toHaveURL(/#\/history$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Storico");

  await nav.getByRole("link", { name: "Grafici" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Grafici");

  await nav.getByRole("link", { name: "Impostazioni" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Impostazioni",
  );
  await expect(nav.getByRole("link", { name: "Impostazioni" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await nav.getByRole("link", { name: "Home" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Spese");
  await expect(
    nav.getByRole("button", { name: "Aggiungi spesa" }),
  ).toBeVisible();
});

test("la lingua scelta cambia i testi e resta dopo il ricaricamento", async ({
  page,
}) => {
  await page.goto("./#/settings");
  await page.getByRole("radio", { name: "English" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Settings");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link", { name: "History" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Settings");
  await expect(page.getByRole("radio", { name: "English" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

test("il tema scelto viene applicato e resta dopo il ricaricamento", async ({
  page,
}) => {
  await page.goto("./#/settings");
  const root = page.locator("html");
  await expect(root).not.toHaveAttribute("data-theme", /.+/);

  await page.getByRole("radio", { name: "Scuro" }).click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(0, 0, 0)",
  );

  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "dark");

  await page.getByRole("radio", { name: "Automatico" }).click();
  await expect(root).not.toHaveAttribute("data-theme", /.+/);
});
