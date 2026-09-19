import { useLiveQuery } from "dexie-react-hooks";
import { getExpense } from "../../data/repositories/expenses";
import { getRecurringRule } from "../../data/repositories/recurringRules";
import type { Expense, RecurringRule } from "../../domain/types";

/** Spesa da modificare: undefined finché non è caricata (o se non c'è più). */
export function useExpenseForEdit(id: string | null): Expense | undefined {
  return useLiveQuery(() => (id === null ? undefined : getExpense(id)), [id]);
}

/**
 * Regola collegata alla spesa: null se non è ricorrente o la regola non esiste più,
 * undefined solo durante il caricamento.
 */
export function useRuleForExpense(
  expense: Expense | undefined,
): RecurringRule | null | undefined {
  const ruleId = expense?.recurringRuleId ?? null;
  return useLiveQuery(
    async () =>
      ruleId === null ? null : ((await getRecurringRule(ruleId)) ?? null),
    [ruleId],
  );
}
