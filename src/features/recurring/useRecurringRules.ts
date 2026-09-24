import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import {
  countActiveRulesInCategory,
  deleteRule,
  getRecurringRules,
  setRuleActive,
  updateRule,
} from "../../data/repositories/recurringRules";
import type { RuleChanges } from "../../domain/recurring";
import type { RecurringRule } from "../../domain/types";
import { errorTextKey } from "../../i18n/errorMessages";
import { useT } from "../../i18n/useT";
import { useUi } from "../../stores/ui";

/** Regole ricorrenti aggiornate in tempo reale (undefined in caricamento). */
export function useRecurringRules(): RecurringRule[] | undefined {
  return useLiveQuery(getRecurringRules, []);
}

/** Quante regole attive userebbero questa categoria (avviso prima di archiviarla). */
export function useActiveRuleCount(categoryId: string | null): number {
  const count = useLiveQuery(
    () =>
      categoryId === null
        ? Promise.resolve(0)
        : countActiveRulesInCategory(categoryId),
    [categoryId],
  );
  return count ?? 0;
}

/** Modifica, sospendi, riattiva ed elimina, con i toast di conferma. */
export function useRuleActions() {
  const t = useT();
  const showToast = useUi((state) => state.showToast);
  return useMemo(() => {
    const run = async (action: () => Promise<void>, message: string) => {
      try {
        await action();
        showToast({ message });
      } catch (error) {
        console.error(error);
        showToast({ message: t(errorTextKey(error)) });
      }
    };
    return {
      toggle: (rule: RecurringRule) =>
        run(
          () => setRuleActive(rule.id, !rule.active),
          rule.active ? t("ruleSuspendedToast") : t("ruleResumedToast"),
        ),
      remove: (rule: RecurringRule) =>
        run(() => deleteRule(rule.id), t("ruleDeletedToast")),
      /** Restituisce false se il salvataggio è fallito: il foglio resta aperto. */
      save: async (
        rule: RecurringRule,
        changes: RuleChanges,
        applyToExisting: boolean,
      ): Promise<boolean> => {
        try {
          const updated = await updateRule(rule.id, changes, applyToExisting);
          showToast({
            message:
              updated > 0
                ? t("ruleExpensesUpdatedToast", updated)
                : t("ruleUpdatedToast"),
          });
          return true;
        } catch (error) {
          console.error(error);
          showToast({ message: t(errorTextKey(error)) });
          return false;
        }
      },
    };
  }, [t, showToast]);
}
