import { useCallback } from "react";
import { useT } from "../../i18n/useT";
import { useUi } from "../../stores/ui";
import { useUpdater } from "../../stores/updater";

/**
 * Chiede al service worker se c'è una nuova versione. Se c'è, compare da solo il toast
 * "Nuova versione disponibile · Aggiorna"; altrimenti si conferma che l'app è aggiornata.
 */
export function useCheckUpdates(): () => Promise<void> {
  const t = useT();
  const showToast = useUi((state) => state.showToast);
  const registration = useUpdater((state) => state.registration);

  return useCallback(async () => {
    if (!registration) {
      showToast({ message: t("updatesUnavailable") });
      return;
    }
    try {
      await registration.update();
      if (!registration.installing && !registration.waiting) {
        showToast({ message: t("upToDate", __APP_VERSION__) });
      }
    } catch (error) {
      console.error(error);
      showToast({ message: t("errorGeneric") });
    }
  }, [registration, showToast, t]);
}
