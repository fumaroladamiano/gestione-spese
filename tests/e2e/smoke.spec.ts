import { expect, test } from "@playwright/test";

test("l’app si apre all’indirizzo di GitHub Pages", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle("Spese");
  await expect(page.getByRole("heading", { name: "Spese" })).toBeVisible();
});
