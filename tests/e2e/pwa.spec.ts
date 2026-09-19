import { expect, test } from "@playwright/test";

test("la pagina dichiara manifest e icona per la schermata Home", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/gestione-spese/manifest.webmanifest",
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    "href",
    "/gestione-spese/apple-touch-icon.png",
  );
  const manifest = await page.request.get("manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  const icon = await page.request.get("apple-touch-icon.png");
  expect(icon.headers()["content-type"]).toBe("image/png");
});

// In WebKit context.setOffline blocca anche le risposte del service worker:
// si verifica che il service worker controlli la pagina e abbia in cache tutto il necessario.
test("il service worker controlla l'app e tiene in cache tutti i file", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate("navigator.serviceWorker.ready.then(() => true)");
  await page.reload();
  await expect
    .poll(() => page.evaluate("navigator.serviceWorker.controller !== null"))
    .toBe(true);

  const cached = await page.evaluate(`
    caches.keys()
      .then((names) => Promise.all(names.map((name) => caches.open(name).then((cache) => cache.keys()))))
      .then((lists) => lists.flat().map((request) => new URL(request.url).pathname))
  `);
  const paths = Array.isArray(cached) ? cached.map(String) : [];
  expect(paths).toContain("/gestione-spese/index.html");
  expect(paths).toContain("/gestione-spese/apple-touch-icon.png");
  expect(paths.some((path) => /\/assets\/index-[\w-]+\.js$/.test(path))).toBe(
    true,
  );
  expect(paths.some((path) => /\/assets\/index-[\w-]+\.css$/.test(path))).toBe(
    true,
  );
});
