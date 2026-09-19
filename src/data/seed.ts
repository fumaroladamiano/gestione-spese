import { BUILTIN_CATEGORIES, sameCategoryName } from "../domain/categories";
import type { Category } from "../domain/types";
import { builtinNamesInAllLanguages } from "../i18n/categoryNames";
import { db } from "./db";

/** Tutti i nomi con cui una categoria può comparire (per riconoscere i doppioni). */
function knownNames(category: Category): string[] {
  if (category.name !== null) return [category.name];
  const builtin = BUILTIN_CATEGORIES.find((item) => item.id === category.id);
  return builtin ? builtinNamesInAllLanguages(builtin.id) : [];
}

/**
 * Aggiunge le categorie predefinite mancanti, a ogni avvio e in modo idempotente:
 * così una predefinita introdotta in una versione successiva (es. Lavoro) arriva anche
 * a chi ha già dati. Non tocca mai le categorie esistenti e non aggiunge una predefinita
 * se l'utente ne ha già creata una con lo stesso nome in una delle lingue.
 * Restituisce il numero di categorie aggiunte.
 */
export async function ensureBuiltinCategories(
  now: Date = new Date(),
): Promise<number> {
  return db.transaction("rw", db.categories, async () => {
    const existing = await db.categories.toArray();
    const existingIds = new Set(existing.map((category) => category.id));
    const existingNames = existing.flatMap(knownNames);
    const missing: Category[] = [];

    for (const builtin of BUILTIN_CATEGORIES) {
      if (existingIds.has(builtin.id)) continue;
      const names = builtinNamesInAllLanguages(builtin.id);
      const clash = existingNames.some((name) =>
        names.some((builtinName) => sameCategoryName(name, builtinName)),
      );
      if (clash) continue;
      missing.push({
        id: builtin.id,
        name: null,
        icon: builtin.icon,
        colorLight: builtin.colorLight,
        colorDark: builtin.colorDark,
        builtin: true,
        archived: false,
        createdAt: now.toISOString(),
      });
    }

    if (missing.length > 0) await db.categories.bulkAdd(missing);
    return missing.length;
  });
}
