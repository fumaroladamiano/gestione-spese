import { planMerge, type BackupData } from "../../domain/backup";
import { BUILTIN_CATEGORIES } from "../../domain/categories";
import type { Category } from "../../domain/types";
import { builtinNamesInAllLanguages } from "../../i18n/categoryNames";
import { db } from "../db";
import { ensureBuiltinCategories } from "../seed";

/** Tutti i dati da esportare, letti in una sola transazione (istantanea coerente). */
export async function readAllData(): Promise<BackupData> {
  return db.transaction(
    "r",
    [db.categories, db.expenses, db.recurringRules, db.settings],
    async () => {
      const [categories, expenses, recurringRules, budget] = await Promise.all([
        db.categories.toArray(),
        db.expenses.orderBy("[date+createdAt]").reverse().toArray(),
        db.recurringRules.toArray(),
        db.settings.get("budgetCents"),
      ]);
      return {
        categories,
        expenses,
        recurringRules,
        budgetCents: budget && budget.value > 0 ? budget.value : null,
      };
    },
  );
}

/** Id delle categorie già presenti: un backup può riferirsi anche a quelle. */
export async function getCategoryIds(): Promise<Set<string>> {
  return new Set(await db.categories.toCollection().primaryKeys());
}

/** "Sostituisci tutto": svuota e riscrive le quattro tabelle nella stessa transazione. */
export async function replaceAllData(data: BackupData): Promise<void> {
  await db.transaction(
    "rw",
    [db.categories, db.expenses, db.recurringRules, db.settings],
    async () => {
      await Promise.all([
        db.categories.clear(),
        db.expenses.clear(),
        db.recurringRules.clear(),
        db.settings.clear(),
      ]);
      await db.categories.bulkAdd(data.categories);
      await db.expenses.bulkAdd(data.expenses);
      await db.recurringRules.bulkAdd(data.recurringRules);
      if (data.budgetCents !== null) {
        await db.settings.put({ key: "budgetCents", value: data.budgetCents });
      }
    },
  );
  // un backup parziale potrebbe non avere tutte le predefinite
  await ensureBuiltinCategories();
}

/** Nomi di una categoria in tutte le lingue, per riconoscere le stesse categorie. */
function namesOf(category: Category): string[] {
  if (category.name !== null) return [category.name];
  const builtin = BUILTIN_CATEGORIES.find((item) => item.id === category.id);
  return builtin ? builtinNamesInAllLanguages(builtin.id) : [];
}

/** "Unisci": aggiunge solo ciò che manca, senza duplicati. Restituisce le spese aggiunte. */
export async function mergeData(data: BackupData): Promise<number> {
  return db.transaction(
    "rw",
    [db.categories, db.expenses, db.recurringRules, db.settings],
    async () => {
      const plan = planMerge(await readAllData(), data, namesOf);
      await db.categories.bulkAdd(plan.categories);
      await db.expenses.bulkAdd(plan.expenses);
      await db.recurringRules.bulkAdd(plan.recurringRules);
      if (plan.budgetCents !== null) {
        await db.settings.put({ key: "budgetCents", value: plan.budgetCents });
      }
      return plan.expenses.length;
    },
  );
}
