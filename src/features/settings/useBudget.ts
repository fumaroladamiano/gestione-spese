import { useLiveQuery } from "dexie-react-hooks";
import { useCallback } from "react";
import {
  getBudgetCents,
  setBudgetCents,
} from "../../data/repositories/settings";
import { formatAmount } from "../../domain/money";
import { errorTextKey } from "../../i18n/errorMessages";
import { useLocale, useT } from "../../i18n/useT";
import { useUi } from "../../stores/ui";

/** Budget mensile: null = nessuno, undefined = in caricamento. */
export function useBudget(): number | null | undefined {
  return useLiveQuery(getBudgetCents, []);
}

/** Salva il budget (null lo toglie) e conferma con un toast. */
export function useSaveBudget(): (cents: number | null) => Promise<void> {
  const t = useT();
  const locale = useLocale();
  const showToast = useUi((state) => state.showToast);
  return useCallback(
    async (cents: number | null) => {
      try {
        await setBudgetCents(cents);
        showToast({
          message:
            cents === null
              ? t("budgetRemoved")
              : t(
                  "budgetSet",
                  formatAmount(cents, locale, { wholeEuros: true }),
                ),
        });
      } catch (error) {
        console.error(error);
        showToast({ message: t(errorTextKey(error)) });
      }
    },
    [t, locale, showToast],
  );
}
