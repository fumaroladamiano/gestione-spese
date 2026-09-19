import { useCallback } from "react";
import {
  getCategoryIds,
  mergeData,
  replaceAllData,
} from "../../data/repositories/backup";
import type { BackupData } from "../../domain/backup";
import { errorTextKey } from "../../i18n/errorMessages";
import { useT } from "../../i18n/useT";
import { useUi } from "../../stores/ui";

export type PendingImport = { fileName: string; data: BackupData };

/** Lettura del file scelto e importazione con "Unisci" o "Sostituisci tutto". */
export function useBackupImport() {
  const t = useT();
  const showToast = useUi((state) => state.showToast);

  /** Valida il file: null (con toast di errore) se non è un backup di Spese. */
  const read = useCallback(
    async (file: File): Promise<PendingImport | null> => {
      // la validazione (zod) si carica solo ora: non pesa sull'avvio dell'app
      const { parseBackup } = await import("../../domain/backupSchema");
      const data = parseBackup(await file.text(), await getCategoryIds());
      if (!data) {
        showToast({ message: t("invalidBackup") });
        return null;
      }
      return { fileName: file.name, data };
    },
    [showToast, t],
  );

  const apply = useCallback(
    async (pending: PendingImport, mode: "merge" | "replace") => {
      try {
        if (mode === "replace") {
          await replaceAllData(pending.data);
          showToast({
            message: t("backupRestored", pending.data.expenses.length),
          });
        } else {
          const added = await mergeData(pending.data);
          showToast({
            message: added > 0 ? t("backupMerged", added) : t("nothingNew"),
          });
        }
      } catch (error) {
        console.error(error);
        showToast({ message: t(errorTextKey(error)) });
      }
    },
    [showToast, t],
  );

  return { read, apply };
}
