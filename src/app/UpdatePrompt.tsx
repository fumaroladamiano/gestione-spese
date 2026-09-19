import { useRegisterSW } from "virtual:pwa-register/react";
import { Toast } from "../components/Toast";
import { useT } from "../i18n/useT";

/**
 * Registra il service worker e, quando una nuova versione è pronta, mostra
 * "Nuova versione disponibile · Aggiorna" invece di ricaricare l'app da sola.
 */
export function UpdatePrompt() {
  const t = useT();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      // iOS tiene l'app sospesa a lungo: si controlla una nuova versione a ogni ritorno in primo piano
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          registration.update().catch((error: unknown) => {
            console.error(error);
          });
        }
      });
    },
    onRegisterError(error: unknown) {
      console.error(error);
    },
  });

  if (!needRefresh) return null;

  return (
    <Toast
      message={t("newVersionAvailable")}
      actionLabel={t("update")}
      onAction={() => {
        void updateServiceWorker(true);
      }}
      closeLabel={t("close")}
      onClose={() => {
        setNeedRefresh(false);
      }}
    />
  );
}
