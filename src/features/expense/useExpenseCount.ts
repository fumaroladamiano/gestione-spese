import { useLiveQuery } from "dexie-react-hooks";
import { countExpenses } from "../../data/repositories/expenses";

/** Numero di spese salvate (0 durante il caricamento). */
export function useExpenseCount(): number {
  return useLiveQuery(countExpenses, []) ?? 0;
}
