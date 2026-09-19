import { useCallback } from "react";
import { addExpense, updateExpense } from "../../data/repositories/expenses";
import {
  addRecurringExpense,
  makeExpenseRecurring,
  setRuleActive,
} from "../../data/repositories/recurringRules";
import { formatAmount } from "../../domain/money";
import type { Category, ExpenseInput } from "../../domain/types";
import { categoryDisplayName } from "../../i18n/categoryNames";
import { errorTextKey } from "../../i18n/errorMessages";
import { useLocale, useT } from "../../i18n/useT";
import { useUi } from "../../stores/ui";

/**
 * Salva una spesa nuova o modificata e mostra il toast di conferma
 * ("12,50 € aggiunti a Ristoranti"). Restituisce false se il salvataggio è fallito.
 * `recurring`: scelta "Ogni mese" attuale e, in modifica, la regola collegata (se c'era).
 */
export function useSaveExpense(): (
  input: ExpenseInput,
  category: Category,
  expenseId: string | null,
  recurring: { enabled: boolean; ruleId: string | null; wasActive: boolean },
) => Promise<boolean> {
  const t = useT();
  const locale = useLocale();
  const showToast = useUi((state) => state.showToast);

  return useCallback(
    async (input, category, expenseId, recurring) => {
      try {
        if (expenseId === null) {
          if (recurring.enabled) await addRecurringExpense(input);
          else await addExpense(input);
          showToast({
            message: t(
              recurring.enabled ? "expenseAddedMonthly" : "expenseAdded",
              formatAmount(input.amountCents, locale),
              categoryDisplayName(category, t),
            ),
          });
        } else {
          await updateExpense(expenseId, input);
          // "Ogni mese" tolto: la regola si sospende; aggiunto: nasce una regola da questa spesa
          if (recurring.wasActive && !recurring.enabled && recurring.ruleId) {
            await setRuleActive(recurring.ruleId, false);
          } else if (!recurring.wasActive && recurring.enabled) {
            if (recurring.ruleId) await setRuleActive(recurring.ruleId, true);
            else await makeExpenseRecurring(expenseId);
          }
          showToast({ message: t("expenseUpdated") });
        }
        return true;
      } catch (error) {
        console.error(error);
        showToast({ message: t(errorTextKey(error)) });
        return false;
      }
    },
    [t, locale, showToast],
  );
}
