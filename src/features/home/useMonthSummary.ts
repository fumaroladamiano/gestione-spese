import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { useToday } from "../../app/useToday";
import {
  getExpensesBetween,
  getRecentExpenses,
} from "../../data/repositories/expenses";
import {
  averagePerDay,
  compareWithPreviousMonth,
  elapsedDays,
  lastDaysTotals,
  sumCents,
  totalsByCategory,
  type CategoryTotal,
  type MonthComparison,
} from "../../domain/aggregations";
import {
  addMonths,
  dayOfMonth,
  daysInMonth,
  monthOf,
  monthRange,
} from "../../domain/dates";
import type { Expense, MonthKey } from "../../domain/types";

export type MonthSummary = {
  month: MonthKey;
  today: string;
  totalCents: number;
  comparison: MonthComparison;
  todayCents: number;
  todayCount: number;
  averageCents: number;
  lastSevenDays: number[];
  topCategories: CategoryTotal[];
  recent: Expense[];
  isEmpty: boolean;
  /** Giorni rimanenti nel mese dopo oggi. */
  daysLeft: number;
};

const RECENT_COUNT = 5;
const TOP_COUNT = 4;

/** Tutto ciò che mostra la Home per il mese in corso (undefined durante il caricamento). */
export function useMonthSummary(): MonthSummary | undefined {
  const today = useToday();
  const month = monthOf(today);
  const previousMonth = addMonths(month, -1);

  // mese in corso e precedente in una sola lettura: servono anche per gli ultimi 7 giorni
  const expenses = useLiveQuery(
    () =>
      getExpensesBetween(
        monthRange(previousMonth).start,
        monthRange(month).end,
      ),
    [month, previousMonth],
  );
  const recent = useLiveQuery(() => getRecentExpenses(RECENT_COUNT), []);

  return useMemo(() => {
    if (!expenses || !recent) return undefined;
    const current = expenses.filter(
      (expense) => monthOf(expense.date) === month,
    );
    const previous = expenses.filter(
      (expense) => monthOf(expense.date) === previousMonth,
    );
    const todayList = current.filter((expense) => expense.date === today);
    const totalCents = sumCents(current);
    return {
      month,
      today,
      totalCents,
      comparison: compareWithPreviousMonth(
        month,
        totalCents,
        previousMonth,
        previous,
        today,
      ),
      todayCents: sumCents(todayList),
      todayCount: todayList.length,
      averageCents: averagePerDay(totalCents, elapsedDays(month, today)),
      lastSevenDays: lastDaysTotals(expenses, today, 7),
      topCategories: totalsByCategory(current).slice(0, TOP_COUNT),
      recent,
      isEmpty: recent.length === 0,
      daysLeft: daysInMonth(month) - dayOfMonth(today),
    };
  }, [expenses, recent, month, previousMonth, today]);
}
