import { addMonths, dayOfMonth, daysInMonth, monthOf } from "./dates";
import type { Expense, ISODate, MonthKey, RecurringRule } from "./types";

/** Data della spesa nel mese: il giorno 31 diventa l'ultimo giorno dei mesi più corti. */
export function occurrenceDate(month: MonthKey, day: number): ISODate {
  const clamped = Math.min(day, daysInMonth(month));
  return `${month}-${String(clamped).padStart(2, "0")}`;
}

/**
 * Date delle spese da generare per una regola: una per ogni mese successivo a
 * lastGeneratedMonth fino al mese corrente, solo se il giorno è già arrivato.
 * Regola sospesa = nessuna data.
 */
export function dueDates(rule: RecurringRule, today: ISODate): ISODate[] {
  if (!rule.active) return [];
  const current = monthOf(today);
  const dates: ISODate[] = [];
  for (
    let month = addMonths(rule.lastGeneratedMonth, 1);
    month <= current;
    month = addMonths(month, 1)
  ) {
    const date = occurrenceDate(month, rule.dayOfMonth);
    if (date <= today) dates.push(date);
  }
  return dates;
}

/** Nuova regola a partire dalla spesa che l'utente ha segnato "Ogni mese". */
export function ruleFromExpense(
  expense: Pick<
    Expense,
    "amountCents" | "categoryId" | "note" | "paymentMethod" | "date"
  >,
  id: string,
  now: Date,
): RecurringRule {
  const timestamp = now.toISOString();
  return {
    id,
    amountCents: expense.amountCents,
    categoryId: expense.categoryId,
    note: expense.note,
    paymentMethod: expense.paymentMethod,
    dayOfMonth: dayOfMonth(expense.date),
    active: true,
    // la spesa di questo mese c'è già: si parte dal mese successivo
    lastGeneratedMonth: monthOf(expense.date),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Riattiva una regola sospesa senza recuperare i mesi saltati:
 * riparte dal mese corrente (se il giorno è già passato la spesa di questo mese viene creata).
 */
export function resumedRule(
  rule: RecurringRule,
  today: ISODate,
  now: Date,
): RecurringRule {
  const previousMonth = addMonths(monthOf(today), -1);
  return {
    ...rule,
    active: true,
    lastGeneratedMonth:
      rule.lastGeneratedMonth > previousMonth
        ? rule.lastGeneratedMonth
        : previousMonth,
    updatedAt: now.toISOString(),
  };
}
