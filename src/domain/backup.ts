import { sameCategoryName } from "./categories";
import {
  type Category,
  type Expense,
  type ISODate,
  type RecurringRule,
} from "./types";

/** Versione del formato del file: cambia solo se cambia la struttura esportata. */
export const BACKUP_SCHEMA_VERSION = 1;

export type BackupData = {
  categories: Category[];
  expenses: Expense[];
  recurringRules: RecurringRule[];
  budgetCents: number | null;
};

export type BackupFile = {
  app: "spese";
  schemaVersion: number;
  exportedAt: string;
  categories: Category[];
  expenses: Expense[];
  recurringRules: RecurringRule[];
  settings: { budgetCents: number | null };
};

/** Contenuto del file JSON: solo dati, nessun testo tradotto né preferenza del dispositivo. */
export function buildBackup(data: BackupData, now: Date): BackupFile {
  return {
    app: "spese",
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    categories: data.categories,
    expenses: data.expenses,
    recurringRules: data.recurringRules,
    settings: { budgetCents: data.budgetCents },
  };
}

export function backupFileName(today: ISODate): string {
  return `spese-backup-${today}.json`;
}

export function csvFileName(today: ISODate): string {
  return `spese-${today}.csv`;
}

/** Chiave con cui due spese si considerano la stessa in "Unisci" (decisione D9). */
function sameExpenseKey(expense: Expense): string {
  return [
    expense.date,
    String(expense.amountCents),
    expense.categoryId,
    expense.note,
  ].join("|");
}

export type MergePlan = {
  categories: Category[];
  expenses: Expense[];
  recurringRules: RecurringRule[];
  /** Budget da impostare, solo se oggi non ce n'è uno. */
  budgetCents: number | null;
};

/**
 * Cosa aggiungere con "Unisci": categorie e regole nuove per id (una categoria con lo stesso
 * nome di una esistente viene ricollegata a quella), spese nuove per id e per contenuto.
 * Non modifica nulla di esistente.
 */
export function planMerge(
  current: BackupData,
  incoming: BackupData,
  displayNames: (category: Category) => string[],
): MergePlan {
  const categoryMap = new Map<string, string>();
  const categories: Category[] = [];
  for (const category of incoming.categories) {
    const sameId = current.categories.find((item) => item.id === category.id);
    if (sameId) {
      categoryMap.set(category.id, sameId.id);
      continue;
    }
    const names = displayNames(category);
    const sameName = current.categories.find((item) =>
      displayNames(item).some((existing) =>
        names.some((name) => sameCategoryName(existing, name)),
      ),
    );
    if (sameName) {
      categoryMap.set(category.id, sameName.id);
    } else {
      categoryMap.set(category.id, category.id);
      categories.push(category);
    }
  }
  const remap = (categoryId: string) =>
    categoryMap.get(categoryId) ?? categoryId;

  const ruleIds = new Set(current.recurringRules.map((rule) => rule.id));
  const recurringRules = incoming.recurringRules
    .filter((rule) => !ruleIds.has(rule.id))
    .map((rule) => ({ ...rule, categoryId: remap(rule.categoryId) }));

  const expenseIds = new Set(current.expenses.map((expense) => expense.id));
  const expenseKeys = new Set(current.expenses.map(sameExpenseKey));
  const expenses: Expense[] = [];
  for (const expense of incoming.expenses) {
    const remapped = { ...expense, categoryId: remap(expense.categoryId) };
    const key = sameExpenseKey(remapped);
    if (expenseIds.has(expense.id) || expenseKeys.has(key)) continue;
    expenseIds.add(expense.id);
    expenseKeys.add(key);
    expenses.push(remapped);
  }

  return {
    categories,
    expenses,
    recurringRules,
    budgetCents: current.budgetCents === null ? incoming.budgetCents : null,
  };
}
