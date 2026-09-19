import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import {
  getExpensesFiltered,
  getOldestExpenseDate,
} from "../../data/repositories/expenses";
import { groupByDay, sumCents, type DayGroup } from "../../domain/aggregations";
import { monthOf, monthRange, todayISO } from "../../domain/dates";
import {
  applyFilters,
  filterDateRange,
  type HistoryFilters,
} from "../../domain/filters";
import type { ISODate, MonthKey } from "../../domain/types";

export type HistoryResult = {
  groups: DayGroup[];
  count: number;
  totalCents: number;
};

/** Spese filtrate e raggruppate per giorno, aggiornate in tempo reale (undefined in caricamento). */
export function useHistory(filters: HistoryFilters): HistoryResult | undefined {
  const { start, end } = filterDateRange(filters);
  const categoryKey = filters.categoryIds.join(",");
  const expenses = useLiveQuery(
    () =>
      getExpensesFiltered(
        start,
        end,
        categoryKey === "" ? [] : categoryKey.split(","),
      ),
    [start, end, categoryKey],
  );
  return useMemo(() => {
    if (!expenses) return undefined;
    // la ricerca nelle note si applica in memoria sul risultato della query (database.md)
    const list = applyFilters(expenses, filters);
    return {
      groups: groupByDay(list),
      count: list.length,
      totalCents: sumCents(list),
    };
  }, [expenses, filters]);
}

export type FilterPreview = {
  count: number;
  totalCents: number;
  /** Giorni del mese del calendario con almeno una spesa (con categorie e ricerca attuali). */
  markedDays: Set<ISODate>;
};

/** Anteprima dal vivo nel foglio filtri: "Mostra N spese · totale" e puntini del calendario. */
export function useFilterPreview(
  draft: HistoryFilters,
  calendarMonth: MonthKey,
): FilterPreview | undefined {
  const range =
    draft.month === null ? filterDateRange(draft) : monthRange(draft.month);
  const calendar = monthRange(calendarMonth);
  const start = range.start < calendar.start ? range.start : calendar.start;
  const end = range.end > calendar.end ? range.end : calendar.end;
  const categoryKey = draft.categoryIds.join(",");
  const expenses = useLiveQuery(
    () =>
      getExpensesFiltered(
        start,
        end,
        categoryKey === "" ? [] : categoryKey.split(","),
      ),
    [start, end, categoryKey],
  );
  return useMemo(() => {
    if (!expenses) return undefined;
    const result = applyFilters(expenses, draft);
    const calendarExpenses = applyFilters(expenses, {
      ...draft,
      month: calendarMonth,
      day: null,
    });
    return {
      count: result.length,
      totalCents: sumCents(result),
      markedDays: new Set(calendarExpenses.map((expense) => expense.date)),
    };
  }, [expenses, draft, calendarMonth]);
}

/** Mesi raggiungibili nei selettori: dal mese della prima spesa a quello corrente. */
export function useMonthBounds(): { min: MonthKey; max: MonthKey } {
  const current = monthOf(todayISO());
  const oldest = useLiveQuery(getOldestExpenseDate, []);
  const min = oldest ? monthOf(oldest) : current;
  return { min: min < current ? min : current, max: current };
}
