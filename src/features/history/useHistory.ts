import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { getAllExpenses } from "../../data/repositories/expenses";
import { groupByDay, type DayGroup } from "../../domain/aggregations";

/**
 * Spese raggruppate per giorno, dalla più recente (undefined durante il caricamento).
 * I filtri per mese, categoria e giorno arrivano nella fase 2.
 */
export function useHistory(): DayGroup[] | undefined {
  const expenses = useLiveQuery(getAllExpenses, []);
  return useMemo(
    () => (expenses ? groupByDay(expenses) : undefined),
    [expenses],
  );
}
