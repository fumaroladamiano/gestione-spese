import { useEffect } from "react";
import { Toast } from "../components/Toast";
import { useUi } from "../stores/ui";

const DURATION_MS = 2600;
/** Con un'azione (es. "Annulla") il messaggio resta di più. */
const DURATION_WITH_ACTION_MS = 4500;

/** Mostra il toast corrente e lo nasconde dopo qualche secondo. */
export function ToastHost() {
  const toast = useUi((state) => state.toast);
  const hideToast = useUi((state) => state.hideToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(
      hideToast,
      toast.onAction ? DURATION_WITH_ACTION_MS : DURATION_MS,
    );
    return () => {
      window.clearTimeout(timer);
    };
  }, [toast, hideToast]);

  if (!toast) return null;
  const { onAction } = toast;
  return (
    <Toast
      key={toast.id}
      message={toast.message}
      actionLabel={toast.actionLabel}
      onAction={
        onAction
          ? () => {
              hideToast();
              onAction();
            }
          : undefined
      }
    />
  );
}
