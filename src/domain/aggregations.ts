import { addDays, dayOfMonth, daysInMonth, monthOf } from "./dates";
import type { Expense, ISODate, MonthKey } from "./types";

export function sumCents(
  expenses: readonly Pick<Expense, "amountCents">[],
): number {
  return expenses.reduce((total, expense) => total + expense.amountCents, 0);
}

export type DayGroup = {
  date: ISODate;
  totalCents: number;
  expenses: Expense[];
};

/**
 * Raggruppa per giorno spese già ordinate dalla più recente
 * (come le restituiscono i repository), mantenendo l'ordine.
 */
export function groupByDay(expenses: readonly Expense[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const expense of expenses) {
    const last = groups.at(-1);
    if (last?.date === expense.date) {
      last.expenses.push(expense);
      last.totalCents += expense.amountCents;
    } else {
      groups.push({
        date: expense.date,
        totalCents: expense.amountCents,
        expenses: [expense],
      });
    }
  }
  return groups;
}

export type CategoryTotal = {
  categoryId: string;
  totalCents: number;
  /** Quota sul totale (0–1); le percentuali si arrotondano solo in visualizzazione. */
  share: number;
};

/** Totali per categoria dal più alto, con la quota sul totale. */
export function totalsByCategory(
  expenses: readonly Expense[],
): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    totals.set(
      expense.categoryId,
      (totals.get(expense.categoryId) ?? 0) + expense.amountCents,
    );
  }
  const grandTotal = sumCents(expenses);
  return [...totals.entries()]
    .map(([categoryId, totalCents]) => ({
      categoryId,
      totalCents,
      share: grandTotal > 0 ? totalCents / grandTotal : 0,
    }))
    .sort((a, b) => b.totalCents - a.totalCents);
}

/** Totale di ogni giorno del mese (indice 0 = giorno 1). */
export function dailyTotals(
  expenses: readonly Expense[],
  month: MonthKey,
): number[] {
  const totals = Array.from({ length: daysInMonth(month) }, () => 0);
  for (const expense of expenses) {
    if (monthOf(expense.date) !== month) continue;
    const index = dayOfMonth(expense.date) - 1;
    totals[index] = (totals[index] ?? 0) + expense.amountCents;
  }
  return totals;
}

/** Totali degli ultimi `days` giorni fino a oggi compreso (il più vecchio per primo). */
export function lastDaysTotals(
  expenses: readonly Expense[],
  today: ISODate,
  days: number,
): number[] {
  const byDate = new Map<string, number>();
  for (const expense of expenses) {
    byDate.set(
      expense.date,
      (byDate.get(expense.date) ?? 0) + expense.amountCents,
    );
  }
  return Array.from(
    { length: days },
    (_, index) => byDate.get(addDays(today, index - days + 1)) ?? 0,
  );
}

/**
 * Giorni del mese già trascorsi (per la media giornaliera):
 * mese in corso fino a oggi, mesi passati interi, mesi futuri 0.
 */
export function elapsedDays(month: MonthKey, today: ISODate): number {
  const current = monthOf(today);
  if (month === current) return dayOfMonth(today);
  return month < current ? daysInMonth(month) : 0;
}

/** Media giornaliera arrotondata al centesimo. */
export function averagePerDay(totalCents: number, days: number): number {
  return days > 0 ? Math.round(totalCents / days) : 0;
}

export type MonthComparison = {
  previousMonth: MonthKey;
  previousCents: number;
  /** Variazione rispetto al mese precedente (0.12 = +12%); null se il precedente è a zero. */
  change: number | null;
  /** true se il confronto è sullo stesso periodo (mese in corso). */
  samePeriod: boolean;
};

/**
 * Confronto con il mese precedente (decisione D6): per il mese in corso si confronta
 * lo stesso periodo (1–16 agosto con 1–16 settembre), per i mesi chiusi il mese intero.
 * `previousExpenses` sono le spese del mese precedente.
 */
export function compareWithPreviousMonth(
  month: MonthKey,
  currentCents: number,
  previousMonth: MonthKey,
  previousExpenses: readonly Expense[],
  today: ISODate,
): MonthComparison {
  const samePeriod = month === monthOf(today);
  const lastDay = dayOfMonth(today);
  const considered = samePeriod
    ? previousExpenses.filter((expense) => dayOfMonth(expense.date) <= lastDay)
    : previousExpenses;
  const previousCents = sumCents(considered);
  return {
    previousMonth,
    previousCents,
    change:
      previousCents > 0 ? (currentCents - previousCents) / previousCents : null,
    samePeriod,
  };
}
