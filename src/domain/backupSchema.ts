import { z } from "zod";
import { BACKUP_SCHEMA_VERSION, type BackupData } from "./backup";
import { CATEGORY_ICONS } from "./categories";
import { isISODate, isMonthKey } from "./dates";
import { isValidAmount } from "./money";
import { LIMITS, PAYMENT_METHODS } from "./types";

// Modulo separato da backup.ts: zod pesa e serve solo quando si importa un file,
// quindi viene caricato su richiesta (import dinamico) e non all'avvio dell'app.

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i);
const id = z.string().min(1).max(64);
const timestamp = z.string().min(1).max(40);
const isoDate = z.string().refine(isISODate);
const amount = z.number().refine(isValidAmount);
const note = z.string().max(LIMITS.noteLength);
const paymentMethod = z.enum(PAYMENT_METHODS);

const categorySchema = z.object({
  id,
  name: z.string().trim().min(1).max(LIMITS.categoryNameLength).nullable(),
  icon: z.enum(CATEGORY_ICONS),
  colorLight: hexColor,
  colorDark: hexColor,
  builtin: z.boolean(),
  archived: z.boolean(),
  createdAt: timestamp,
});

const expenseSchema = z.object({
  id,
  amountCents: amount,
  categoryId: id,
  date: isoDate,
  note,
  paymentMethod,
  recurringRuleId: id.optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

const recurringRuleSchema = z.object({
  id,
  amountCents: amount,
  categoryId: id,
  note,
  paymentMethod,
  dayOfMonth: z.number().int().min(1).max(31),
  active: z.boolean(),
  lastGeneratedMonth: z.string().refine(isMonthKey),
  createdAt: timestamp,
  updatedAt: timestamp,
});

const backupSchema = z.object({
  app: z.literal("spese"),
  schemaVersion: z.number().int().min(1).max(BACKUP_SCHEMA_VERSION),
  exportedAt: timestamp,
  categories: z.array(categorySchema),
  expenses: z.array(expenseSchema),
  recurringRules: z.array(recurringRuleSchema).default([]),
  settings: z
    .object({ budgetCents: amount.nullable().default(null) })
    .default({ budgetCents: null }),
});

/**
 * Legge e valida un file di backup. null se non è un backup di Spese valido
 * (JSON rotto, campi mancanti, importi o date non validi, versione futura).
 * Le spese devono puntare a categorie presenti nel file oppure in `knownCategoryIds`.
 */
export function parseBackup(
  text: string,
  knownCategoryIds: ReadonlySet<string> = new Set(),
): BackupData | null {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return null;
  }
  const result = backupSchema.safeParse(json);
  if (!result.success) return null;
  const file = result.data;
  const categoryIds = new Set([
    ...knownCategoryIds,
    ...file.categories.map((category) => category.id),
  ]);
  const referencesOk = [...file.expenses, ...file.recurringRules].every(
    (item) => categoryIds.has(item.categoryId),
  );
  if (!referencesOk) return null;
  return {
    categories: file.categories,
    // zod lascia la chiave assente se manca: il tipo resta quello di Expense
    expenses: file.expenses.map(({ recurringRuleId, ...expense }) =>
      recurringRuleId === undefined ? expense : { ...expense, recurringRuleId },
    ),
    recurringRules: file.recurringRules,
    budgetCents: file.settings.budgetCents,
  };
}
