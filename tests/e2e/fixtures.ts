import { test as base } from "@playwright/test";

/**
 * Nei test la pagina è aperta "in Safari" (non installata): la guida all'installazione
 * si aprirebbe da sola al primo accesso. Si segna come già vista, solo se non c'è
 * nulla di salvato, così i ricaricamenti non cancellano le preferenze scelte nel test.
 */
export const test = base.extend({
  // il secondo parametro di Playwright si chiama di solito "use": qui "provide" per non confonderlo con un hook React
  page: async ({ page }, provide) => {
    await page.addInitScript(() => {
      if (localStorage.getItem("spese:prefs") === null) {
        localStorage.setItem(
          "spese:prefs",
          JSON.stringify({ state: { installGuideSeen: true }, version: 1 }),
        );
      }
    });
    await provide(page);
  },
});

export { expect } from "@playwright/test";
export type { Page } from "@playwright/test";
