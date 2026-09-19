import type { ThemePreference } from "../stores/prefs";

// Colore della barra di stato e dello sfondo di sistema: coincide con --color-background
const THEME_COLOR = { light: "#F3F3F8", dark: "#000000" } as const;

/**
 * Applica il tema alla pagina: "auto" segue il tema dell'iPhone (prefers-color-scheme),
 * "light" e "dark" lo forzano tramite l'attributo data-theme letto da tokens.css.
 */
export function applyTheme(
  preference: ThemePreference,
  doc: Document = document,
): void {
  const root = doc.documentElement;
  if (preference === "auto") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = preference;
  }

  // Due meta theme-color (uno per media query): se il tema è forzato valgono entrambi uguali
  for (const meta of doc.querySelectorAll<HTMLMetaElement>(
    'meta[name="theme-color"]',
  )) {
    const scheme = meta.getAttribute("media")?.includes("dark")
      ? "dark"
      : "light";
    meta.content = THEME_COLOR[preference === "auto" ? scheme : preference];
  }
}
