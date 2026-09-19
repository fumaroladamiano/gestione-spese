import { useCallback } from "react";
import { addExpense, updateExpense } from "../../data/repositories/expenses";
import { formatAmount } from "../../domain/money";
import type { Category, ExpenseInput } from "../../domain/types";
import { categoryDisplayName } from "../../i18n/categoryNames";
import { errorTextKey } from "../../i18n/errorMessages";
import { useLocale, useT } from "../../i18n/useT";
import { useUi } from "../../stores/ui";

/**
 * Salva una spesa nuova o modificata e mostra il toast di conferma
 * ("12,50 € aggiunti a Ristoranti"). Restituisce false se il salvataggio è fallito.
 */
export function useSaveExpense(): (
  input: ExpenseInput,
  category: Category,
  expenseId: string | null,
) => Promise<boolean> {
  const t = useT();
  const locale = useLocale();
  const showToast = useUi((state) => state.showToast);

  return useCallback(
    async (input, category, expenseId) => {
      try {
        if (expenseId === null) {
          await addExpense(input);
          showToast({
            message: t(
              "expenseAdded",
              formatAmount(input.amountCents, locale),
              categoryDisplayName(category, t),
            ),
          });
        } else {
          await updateExpense(expenseId, input);
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
