import { Dexie } from "dexie";
import { isISODate, todayISO } from "../../domain/dates";
import { newId } from "../../domain/ids";
import { isValidAmount } from "../../domain/money";
import {
  isPaymentMethod,
  LIMITS,
  type Expense,
  type ExpenseInput,
  type ISODate,
} from "../../domain/types";
import { db } from "../db";
import { DataError } from "../errors";

/** Controlla e normalizza i campi inseriti; lancia DataError se non validi. */
async function validate(
  input: ExpenseInput,
  now: Date,
  allowArchivedCategory: boolean,
): Promise<ExpenseInput> {
  if (!isValidAmount(input.amountCents)) throw new DataError("invalidAmount");
  if (!isISODate(input.date)) throw new DataError("invalidDate");
  if (input.date > todayISO(now)) throw new DataError("futureDate");
  if (!isPaymentMethod(input.paymentMethod)) {
    throw new DataError("invalidPaymentMethod");
  }
  const note = input.note.trim();
  if (note.length > LIMITS.noteLength) throw new DataError("invalidNote");

  const category = await db.categories.get(input.categoryId);
  if (!category) throw new DataError("unknownCategory");
  if (category.archived && !allowArchivedCategory) {
    throw new DataError("archivedCategory");
  }
  return { ...input, note };
}

/** Registra una nuova spesa (categoria attiva, data non futura). */
export async function addExpense(
  input: ExpenseInput,
  now: Date = new Date(),
): Promise<Expense> {
  return db.transaction("rw", db.expenses, db.categories, async () => {
    const valid = await validate(input, now, false);
    const timestamp = now.toISOString();
    const expense: Expense = {
      id: newId(),
      ...valid,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.expenses.add(expense);
    return expense;
  });
}

/** Modifica una spesa: la categoria può restare quella archiviata che aveva già. */
export async function updateExpense(
  id: string,
  input: ExpenseInput,
  now: Date = new Date(),
): Promise<Expense> {
  return db.transaction("rw", db.expenses, db.categories, async () => {
    const current = await db.expenses.get(id);
    if (!current) throw new DataError("expenseNotFound");
    const valid = await validate(
      input,
      now,
      input.categoryId === current.categoryId,
    );
    const updated: Expense = {
      ...current,
      ...valid,
      updatedAt: now.toISOString(),
    };
    await db.expenses.put(updated);
    return updated;
  });
}

/** Elimina una spesa e la restituisce, così il toast "Annulla" può ripristinarla. */
export async function deleteExpense(id: string): Promise<Expense | undefined> {
  return db.transaction("rw", db.expenses, async () => {
    const expense = await db.expenses.get(id);
    if (expense) await db.expenses.delete(id);
    return expense;
  });
}

/** Rimette una spesa eliminata con lo stesso id e le stesse date di creazione. */
export async function restoreExpense(expense: Expense): Promise<void> {
  await db.expenses.put(expense);
}

/** Spese tra due date incluse, dalla più recente (nello stesso giorno: ultima inserita prima). */
export async function getExpensesBetween(
  start: ISODate,
  end: ISODate,
): Promise<Expense[]> {
  const list = await db.expenses
    .where("[date+createdAt]")
    .between([start, Dexie.minKey], [end, Dexie.maxKey], true, true)
    .toArray();
  return list.reverse();
}

/** Ordine delle liste: giorno più recente prima, nello stesso giorno ultima inserita prima. */
function newestFirst(a: Expense, b: Expense): number {
  return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
}

/**
 * Spese tra due date incluse, solo delle categorie indicate (tutte se l'elenco è vuoto).
 * Con le categorie usa l'indice composto [categoryId+date]: si leggono solo le spese utili.
 */
export async function getExpensesFiltered(
  start: ISODate,
  end: ISODate,
  categoryIds: readonly string[],
): Promise<Expense[]> {
  if (categoryIds.length === 0) return getExpensesBetween(start, end);
  const lists = await Promise.all(
    categoryIds.map((categoryId) =>
      db.expenses
        .where("[categoryId+date]")
        .between([categoryId, start], [categoryId, end], true, true)
        .toArray(),
    ),
  );
  return lists.flat().sort(newestFirst);
}

/** Data della prima spesa registrata (per non andare indietro oltre nei selettori del mese). */
export async function getOldestExpenseDate(): Promise<ISODate | null> {
  const oldest = await db.expenses.orderBy("date").first();
  return oldest?.date ?? null;
}

/** Tutte le spese, dalla più recente. */
export async function getAllExpenses(): Promise<Expense[]> {
  return db.expenses.orderBy("[date+createdAt]").reverse().toArray();
}

/** Le ultime spese inserite (Home). */
export async function getRecentExpenses(limit: number): Promise<Expense[]> {
  return db.expenses
    .orderBy("[date+createdAt]")
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getExpense(id: string): Promise<Expense | undefined> {
  return db.expenses.get(id);
}

export async function countExpenses(): Promise<number> {
  return db.expenses.count();
}

export async function countExpensesInCategory(
  categoryId: string,
): Promise<number> {
  return db.expenses.where("categoryId").equals(categoryId).count();
}
