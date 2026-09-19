import { useLiveQuery } from "dexie-react-hooks";
import { getExpense } from "../../data/repositories/expenses";
import type { Expense } from "../../domain/types";

/** Spesa da modificare: undefined finché non è caricata (o se non c'è più). */
export function useExpenseForEdit(id: string | null): Expense | undefined {
  return useLiveQuery(() => (id === null ? undefined : getExpense(id)), [id]);
}
