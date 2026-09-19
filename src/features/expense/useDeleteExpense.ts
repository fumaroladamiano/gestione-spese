import { useCallback } from "react";
import {
  deleteExpense,
  restoreExpense,
} from "../../data/repositories/expenses";
import { errorTextKey } from "../../i18n/errorMessages";
import { useT } from "../../i18n/useT";
import { useUi } from "../../stores/ui";

/** Elimina una spesa e offre "Annulla" nel toast (nessuna conferma bloccante). */
export function useDeleteExpense(): (id: string) => Promise<void> {
  const t = useT();
  const showToast = useUi((state) => state.showToast);

  return useCallback(
    async (id: string) => {
      try {
        const removed = await deleteExpense(id);
        if (!removed) return;
        showToast({
          message: t("expenseDeleted"),
          actionLabel: t("undo"),
          onAction: () => {
            restoreExpense(removed)
              .then(() => {
                showToast({ message: t("expenseRestored") });
              })
              .catch((error: unknown) => {
                console.error(error);
                showToast({ message: t(errorTextKey(error)) });
              });
          },
        });
      } catch (error) {
        console.error(error);
        showToast({ message: t(errorTextKey(error)) });
      }
    },
    [t, showToast],
  );
}
