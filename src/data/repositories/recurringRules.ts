import { todayISO } from "../../domain/dates";
import { newId } from "../../domain/ids";
import { isValidAmount } from "../../domain/money";
import {
  dueDates,
  isValidDayOfMonth,
  resumedRule,
  ruleFromExpense,
  ruleWithChanges,
  type RuleChanges,
} from "../../domain/recurring";
import {
  LIMITS,
  isPaymentMethod,
  type Expense,
  type ExpenseInput,
  type RecurringRule,
} from "../../domain/types";
import { db } from "../db";
import { DataError } from "../errors";
import { addExpense } from "./expenses";

/** Regole in ordine di creazione. */
export async function getRecurringRules(): Promise<RecurringRule[]> {
  const rules = await db.recurringRules.toArray();
  return rules.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getRecurringRule(
  id: string,
): Promise<RecurringRule | undefined> {
  return db.recurringRules.get(id);
}

/** Collega una spesa esistente a una nuova regola mensile basata su di essa. */
export async function makeExpenseRecurring(
  expenseId: string,
  now: Date = new Date(),
): Promise<RecurringRule> {
  return db.transaction("rw", db.expenses, db.recurringRules, async () => {
    const expense = await db.expenses.get(expenseId);
    if (!expense) throw new DataError("expenseNotFound");
    const rule = ruleFromExpense(expense, newId(), now);
    await db.recurringRules.add(rule);
    await db.expenses.put({ ...expense, recurringRuleId: rule.id });
    return rule;
  });
}

/** Registra una spesa "Ogni mese": la spesa e la sua regola nella stessa transazione. */
export async function addRecurringExpense(
  input: ExpenseInput,
  now: Date = new Date(),
): Promise<Expense> {
  return db.transaction(
    "rw",
    [db.expenses, db.categories, db.recurringRules],
    async () => {
      const expense = await addExpense(input, now);
      const rule = await makeExpenseRecurring(expense.id, now);
      return { ...expense, recurringRuleId: rule.id };
    },
  );
}

/**
 * Salva le modifiche fatte nel foglio della regola. Con `applyToExisting` il nuovo importo
 * si applica anche alle spese già generate dalla regola (compresi i mesi chiusi); nota,
 * giorno e metodo valgono solo per le occorrenze future. Restituisce le spese aggiornate.
 */
export async function updateRule(
  id: string,
  changes: RuleChanges,
  applyToExisting = false,
  now: Date = new Date(),
): Promise<number> {
  if (!isValidAmount(changes.amountCents)) throw new DataError("invalidAmount");
  if (!isValidDayOfMonth(changes.dayOfMonth)) {
    throw new DataError("invalidDayOfMonth");
  }
  if (!isPaymentMethod(changes.paymentMethod)) {
    throw new DataError("invalidPaymentMethod");
  }
  if (changes.note.trim().length > LIMITS.noteLength) {
    throw new DataError("invalidNote");
  }
  return db.transaction("rw", db.expenses, db.recurringRules, async () => {
    const rule = await db.recurringRules.get(id);
    if (!rule) throw new DataError("ruleNotFound");
    await db.recurringRules.put(ruleWithChanges(rule, changes, now));
    if (!applyToExisting || changes.amountCents === rule.amountCents) return 0;
    const timestamp = now.toISOString();
    return db.expenses
      .where("recurringRuleId")
      .equals(id)
      .modify((expense) => {
        expense.amountCents = changes.amountCents;
        expense.updatedAt = timestamp;
      });
  });
}

/** Regole attive di una categoria: servono per avvisare prima di archiviarla. */
export async function countActiveRulesInCategory(
  categoryId: string,
): Promise<number> {
  const rules = await db.recurringRules.toArray();
  return rules.filter((rule) => rule.active && rule.categoryId === categoryId)
    .length;
}

/** Sospende o riattiva una regola (riattivando non si recuperano i mesi saltati). */
export async function setRuleActive(
  id: string,
  active: boolean,
  now: Date = new Date(),
): Promise<void> {
  await db.transaction("rw", db.recurringRules, async () => {
    const rule = await db.recurringRules.get(id);
    if (!rule) return;
    await db.recurringRules.put(
      active
        ? resumedRule(rule, todayISO(now), now)
        : { ...rule, active: false, updatedAt: now.toISOString() },
    );
  });
}

/** Elimina una regola: le spese già create restano, senza più il simbolo ↻. */
export async function deleteRule(id: string): Promise<void> {
  await db.transaction("rw", db.expenses, db.recurringRules, async () => {
    await db.recurringRules.delete(id);
    await db.expenses
      .where("recurringRuleId")
      .equals(id)
      .modify((expense) => {
        delete expense.recurringRuleId;
      });
  });
}

/**
 * Crea le spese dovute di tutte le regole attive (all'avvio e al ritorno in primo piano).
 * Tutto in una transazione e con lastGeneratedMonth aggiornato: riaprire l'app più volte
 * non crea duplicati. Restituisce il numero di spese create.
 */
export async function generateDueExpenses(
  now: Date = new Date(),
): Promise<number> {
  const today = todayISO(now);
  return db.transaction(
    "rw",
    [db.expenses, db.categories, db.recurringRules],
    async () => {
      const rules = await db.recurringRules.toArray();
      let created = 0;
      for (const rule of rules) {
        const dates = dueDates(rule, today);
        const lastDate = dates.at(-1);
        if (lastDate === undefined) continue;
        // una regola la cui categoria non esiste più viene sospesa invece di fallire
        if (!(await db.categories.get(rule.categoryId))) {
          await db.recurringRules.put({
            ...rule,
            active: false,
            updatedAt: now.toISOString(),
          });
          continue;
        }
        const timestamp = now.toISOString();
        await db.expenses.bulkAdd(
          dates.map((date) => ({
            id: newId(),
            amountCents: rule.amountCents,
            categoryId: rule.categoryId,
            date,
            note: rule.note,
            paymentMethod: rule.paymentMethod,
            recurringRuleId: rule.id,
            createdAt: timestamp,
            updatedAt: timestamp,
          })),
        );
        await db.recurringRules.put({
          ...rule,
          lastGeneratedMonth: lastDate.slice(0, 7),
          updatedAt: timestamp,
        });
        created += dates.length;
      }
      return created;
    },
  );
}
