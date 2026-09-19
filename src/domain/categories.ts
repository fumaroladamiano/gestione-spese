import type { Category } from "./types";

/**
 * Categorie predefinite: id stabili, icona salvata e colori (proposta § 1.5).
 * L'ordine dell'elenco è quello mostrato; "altro" resta l'ultima tra le predefinite.
 */
export const BUILTIN_CATEGORIES = [
  { id: "spesa", icon: "cart", colorLight: "#34C759", colorDark: "#30D158" },
  { id: "trasporti", icon: "car", colorLight: "#007AFF", colorDark: "#0A84FF" },
  {
    id: "ristoranti",
    icon: "food",
    colorLight: "#FF9500",
    colorDark: "#FF9F0A",
  },
  { id: "casa", icon: "home", colorLight: "#A2845E", colorDark: "#AC8E68" },
  { id: "salute", icon: "heart", colorLight: "#FF2D55", colorDark: "#FF375F" },
  { id: "svago", icon: "star", colorLight: "#AF52DE", colorDark: "#BF5AF2" },
  {
    id: "abbonamenti",
    icon: "repeat",
    colorLight: "#30B0C7",
    colorDark: "#40C8E0",
  },
  {
    id: "lavoro",
    icon: "briefcase",
    colorLight: "#5A6B8C",
    colorDark: "#8FA0C4",
  },
  { id: "altro", icon: "dots", colorLight: "#8E8E93", colorDark: "#98989D" },
] as const;

export type BuiltinCategoryId = (typeof BUILTIN_CATEGORIES)[number]["id"];

/** Categoria che raccoglie le spese generiche: non si archivia né si elimina. */
export const FALLBACK_CATEGORY_ID: BuiltinCategoryId = "altro";

/** Nomi propri delle icone salvati nei dati (convertiti in icone Lucide solo nella UI). */
export const CATEGORY_ICONS = [
  "cart",
  "car",
  "food",
  "home",
  "heart",
  "star",
  "repeat",
  "dots",
  "gift",
  "plane",
  "book",
  "dumbbell",
  "shirt",
  "coffee",
  "briefcase",
] as const;
export type CategoryIconName = (typeof CATEGORY_ICONS)[number];

/** Palette per le categorie: variante chiara e scura. */
export const CATEGORY_COLORS = [
  { light: "#34C759", dark: "#30D158" },
  { light: "#007AFF", dark: "#0A84FF" },
  { light: "#FF9500", dark: "#FF9F0A" },
  { light: "#A2845E", dark: "#AC8E68" },
  { light: "#FF2D55", dark: "#FF375F" },
  { light: "#AF52DE", dark: "#BF5AF2" },
  { light: "#30B0C7", dark: "#40C8E0" },
  { light: "#8E8E93", dark: "#98989D" },
  { light: "#FFCC00", dark: "#FFD60A" },
  { light: "#00C7BE", dark: "#63E6E2" },
  { light: "#5856D6", dark: "#5E5CE6" },
  { light: "#FF3B30", dark: "#FF453A" },
  { light: "#32ADE6", dark: "#64D2FF" },
  { light: "#C2185B", dark: "#EC407A" },
  { light: "#5A6B8C", dark: "#8FA0C4" },
] as const;

const BUILTIN_ORDER = new Map<string, number>(
  BUILTIN_CATEGORIES.map((category, index) => [category.id, index]),
);

export function isBuiltinCategoryId(id: string): id is BuiltinCategoryId {
  return BUILTIN_ORDER.has(id);
}

export function isCategoryIcon(value: unknown): value is CategoryIconName {
  return CATEGORY_ICONS.some((icon) => icon === value);
}

/** Predefinite nell'ordine fisso, poi quelle dell'utente per data di creazione. */
export function sortCategories(categories: readonly Category[]): Category[] {
  return [...categories].sort((a, b) => {
    const orderA = BUILTIN_ORDER.get(a.id);
    const orderB = BUILTIN_ORDER.get(b.id);
    if (orderA !== undefined && orderB !== undefined) return orderA - orderB;
    if (orderA !== undefined) return -1;
    if (orderB !== undefined) return 1;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

/** Confronto dei nomi senza distinzione di maiuscole e spazi ai lati. */
export function sameCategoryName(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();
}
