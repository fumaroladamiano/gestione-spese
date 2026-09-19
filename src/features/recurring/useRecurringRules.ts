import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import {
  deleteRule,
  getRecurringRules,
  setRuleActive,
} from "../../data/repositories/recurringRules";
import type { RecurringRule } from "../../domain/types";
import { errorTextKey } from "../../i18n/errorMessages";
import { useT } from "../../i18n/useT";
import { useUi } from "../../stores/ui";

/** Regole ricorrenti aggiornate in tempo reale (undefined in caricamento). */
export function useRecurringRules(): RecurringRule[] | undefined {
  return useLiveQuery(getRecurringRules, []);
}

/** Sospendi, riattiva ed elimina, con i toast di conferma. */
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
    };
  }, [t, showToast]);
}
