import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { useToday } from "../../app/useToday";
import { getExpensesBetween } from "../../data/repositories/expenses";
import {
  averagePerDay,
  compareWithPreviousMonth,
  dailyTotals,
  elapsedDays,
  sumCents,
  totalsByCategory,
  type CategoryTotal,
  type MonthComparison,
} from "../../domain/aggregations";
import { addMonths, monthOf, monthRange } from "../../domain/dates";
import type { ISODate, MonthKey } from "../../domain/types";

export type ChartsData = {
  month: MonthKey;
  today: ISODate;
  isCurrentMonth: boolean;
  totalCents: number;
  comparison: MonthComparison;
  byCategory: CategoryTotal[];
  /** Totale di ogni giorno del mese (indice 0 = giorno 1). */
  daily: number[];
  averageCents: number;
};

/** Dati dei grafici di un mese e confronto con il precedente (undefined in caricamento). */
export function useChartsData(month: MonthKey): ChartsData | undefined {
  const today = useToday();
  const previousMonth = addMonths(month, -1);
  const expenses = useLiveQuery(
    () =>
      getExpensesBetween(
        monthRange(previousMonth).start,
        monthRange(month).end,
      ),
    [month, previousMonth],
  );

  return useMemo(() => {
    if (!expenses) return undefined;
    const current = expenses.filter(
      (expense) => monthOf(expense.date) === month,
    );
    const previous = expenses.filter(
      (expense) => monthOf(expense.date) === previousMonth,
    );
    const totalCents = sumCents(current);
    return {
      month,
      today,
      isCurrentMonth: month === monthOf(today),
      totalCents,
      comparison: compareWithPreviousMonth(
        month,
        totalCents,
        previousMonth,
        previous,
        today,
      ),
      byCategory: totalsByCategory(current),
      daily: dailyTotals(current, month),
      averageCents: averagePerDay(totalCents, elapsedDays(month, today)),
    };
  }, [expenses, month, previousMonth, today]);
}
