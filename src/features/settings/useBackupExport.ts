import { useCallback, useMemo } from "react";
import { readAllData } from "../../data/repositories/backup";
import { backupFileName, buildBackup, csvFileName } from "../../domain/backup";
import { FALLBACK_CATEGORY_ID } from "../../domain/categories";
import { buildCsv } from "../../domain/csv";
import { todayISO } from "../../domain/dates";
import { createT } from "../../i18n";
import {
  categoryDisplayName,
  paymentMethodName,
} from "../../i18n/categoryNames";
import { useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import { useUi } from "../../stores/ui";

export type ExportKind = "json" | "csv";

export type ExportFile = {
  kind: ExportKind;
  file: File;
  text: string;
};

/** Crea il file di backup (JSON) o per Excel (CSV) con i dati attuali. */
async function buildExportFile(kind: ExportKind): Promise<ExportFile> {
  const data = await readAllData();
  const today = todayISO();
  if (kind === "json") {
    const text = JSON.stringify(buildBackup(data, new Date()), null, 2);
    return {
      kind,
      text,
      file: new File([text], backupFileName(today), {
        type: "application/json",
      }),
    };
  }
  // il CSV è sempre in italiano, qualunque sia la lingua dell'app
  const italian = createT("it");
  const categories = new Map(
    data.categories.map((category) => [category.id, category]),
  );
  const text = buildCsv(
    data.expenses,
    (id) => {
      const category =
        categories.get(id) ?? categories.get(FALLBACK_CATEGORY_ID);
      return category ? categoryDisplayName(category, italian) : id;
    },
    (expense) => paymentMethodName(expense.paymentMethod, italian),
  );
  return {
    kind,
    text,
    file: new File([text], csvFileName(today), { type: "text/csv" }),
  };
}

function canShareFile(file: File): boolean {
  try {
    return (
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] })
    );
  } catch {
    return false;
  }
}

/** Esportazione con lo share sheet di iOS, download o copia negli appunti, con i toast. */
export function useBackupExport() {
  const t = useT();
  const showToast = useUi((state) => state.showToast);
  const setLastBackupDate = usePrefs((state) => state.setLastBackupDate);

  // solo il JSON conta come backup: il CSV non si può reimportare
  const markDone = useCallback(
    (exported: ExportFile) => {
      if (exported.kind === "json") setLastBackupDate(todayISO());
    },
    [setLastBackupDate],
  );

  const share = useCallback(
    async (exported: ExportFile) => {
      try {
        await navigator.share({
          files: [exported.file],
          title: exported.file.name,
        });
        markDone(exported);
        showToast({ message: t("backupShared") });
      } catch (error) {
        // chiudere lo share sheet senza scegliere non è un errore
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        console.error(error);
        showToast({ message: t("shareFailed") });
      }
    },
    [markDone, showToast, t],
  );

  const download = useCallback(
    (exported: ExportFile) => {
      const url = URL.createObjectURL(exported.file);
      const link = document.createElement("a");
      link.href = url;
      link.download = exported.file.name;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 5000);
      markDone(exported);
      showToast({ message: t("fileDownloaded", exported.file.name) });
    },
    [markDone, showToast, t],
  );

  const copy = useCallback(
    async (exported: ExportFile) => {
      try {
        await navigator.clipboard.writeText(exported.text);
        markDone(exported);
        showToast({ message: t("copied") });
      } catch (error) {
        console.error(error);
        showToast({ message: t("copyFailed") });
      }
    },
    [markDone, showToast, t],
  );

  return useMemo(
    () => ({
      build: buildExportFile,
      canShare: canShareFile,
      share,
      download,
      copy,
    }),
    [share, download, copy],
  );
}
