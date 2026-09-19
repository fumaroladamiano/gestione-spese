import {
  BUILTIN_CATEGORIES,
  FALLBACK_CATEGORY_ID,
  isCategoryIcon,
  sameCategoryName,
  sortCategories,
} from "../../domain/categories";
import { newId } from "../../domain/ids";
import { LIMITS, type Category } from "../../domain/types";
import { builtinNamesInAllLanguages } from "../../i18n/categoryNames";
import { db } from "../db";
import { DataError } from "../errors";

export type CategoryStyle = Pick<Category, "icon" | "colorLight" | "colorDark">;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function validateStyle(style: CategoryStyle): void {
  if (
    !isCategoryIcon(style.icon) ||
    !HEX_COLOR.test(style.colorLight) ||
    !HEX_COLOR.test(style.colorDark)
  ) {
    throw new DataError("invalidCategoryStyle");
  }
}

/** Nomi con cui una categoria compare: per le predefinite non rinominate, in tutte le lingue. */
function namesOf(category: Category): string[] {
  if (category.name !== null) return [category.name];
  const builtin = BUILTIN_CATEGORIES.find((item) => item.id === category.id);
  return builtin ? builtinNamesInAllLanguages(builtin.id) : [];
}

function validateName(name: string, others: Category[]): string {
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > LIMITS.categoryNameLength) {
    throw new DataError("invalidCategoryName");
  }
  const duplicate = others.some((other) =>
    namesOf(other).some((existing) => sameCategoryName(existing, trimmed)),
  );
  if (duplicate) throw new DataError("duplicateCategoryName");
  return trimmed;
}

function activeCount(categories: Category[]): number {
  return categories.filter((category) => !category.archived).length;
}

/** Tutte le categorie in ordine: predefinite, poi quelle dell'utente per data. */
export async function getCategories(): Promise<Category[]> {
  return sortCategories(await db.categories.toArray());
}

export async function createCategory(
  name: string,
  style: CategoryStyle,
  now: Date = new Date(),
): Promise<Category> {
  validateStyle(style);
  return db.transaction("rw", db.categories, async () => {
    const all = await db.categories.toArray();
    if (activeCount(all) >= LIMITS.maxActiveCategories) {
      throw new DataError("categoryLimit");
    }
    const category: Category = {
      id: newId(),
      name: validateName(name, all),
      ...style,
      builtin: false,
      archived: false,
      createdAt: now.toISOString(),
    };
    await db.categories.add(category);
    return category;
  });
}

/**
 * Rinomina, ricolora o cambia icona. Per una predefinita mai rinominata, salvare il nome
 * tradotto senza modificarlo lascia name = null, così continua a seguire la lingua.
 */
export async function updateCategory(
  id: string,
  name: string,
  style: CategoryStyle,
): Promise<Category> {
  validateStyle(style);
  return db.transaction("rw", db.categories, async () => {
    const all = await db.categories.toArray();
    const current = all.find((category) => category.id === id);
    if (!current) throw new DataError("categoryNotFound");
    const keepsTranslation =
      current.name === null &&
      namesOf(current).some((translated) => translated === name.trim());
    const updated: Category = {
      ...current,
      ...style,
      name: keepsTranslation
        ? null
        : validateName(
            name,
            all.filter((category) => category.id !== id),
          ),
    };
    await db.categories.put(updated);
    return updated;
  });
}

/** Archivia: la categoria sparisce da inserimento e filtri ma resta nello storico. */
export async function archiveCategory(id: string): Promise<void> {
  if (id === FALLBACK_CATEGORY_ID) throw new DataError("protectedCategory");
  await db.transaction("rw", db.categories, async () => {
    const category = await db.categories.get(id);
    if (!category) throw new DataError("categoryNotFound");
    await db.categories.put({ ...category, archived: true });
  });
}

export async function restoreCategory(id: string): Promise<void> {
  await db.transaction("rw", db.categories, async () => {
    const all = await db.categories.toArray();
    const category = all.find((item) => item.id === id);
    if (!category) throw new DataError("categoryNotFound");
    if (!category.archived) return;
    if (activeCount(all) >= LIMITS.maxActiveCategories) {
      throw new DataError("categoryLimit");
    }
    await db.categories.put({ ...category, archived: false });
  });
}

/** Elimina solo una categoria personalizzata senza spese; le altre si archiviano. */
export async function deleteCategory(id: string): Promise<void> {
  await db.transaction("rw", db.categories, db.expenses, async () => {
    const category = await db.categories.get(id);
    if (!category) throw new DataError("categoryNotFound");
    if (category.builtin) throw new DataError("protectedCategory");
    const used = await db.expenses.where("categoryId").equals(id).count();
    if (used > 0) throw new DataError("categoryInUse");
    await db.categories.delete(id);
  });
}
