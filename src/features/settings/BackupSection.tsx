import { Download, Info, Share } from "lucide-react";
import { useRef, useState } from "react";
import { ActionSheet, type SheetAction } from "../../components/ActionSheet";
import { ListGroup } from "../../components/ListGroup";
import { daysBetween, todayISO } from "../../domain/dates";
import { formatKilobytes } from "../../domain/money";
import { useLocale, useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import styles from "./BackupSection.module.css";
import { SettingsRow } from "./SettingsRow";
import {
  useBackupExport,
  type ExportFile,
  type ExportKind,
} from "./useBackupExport";
import { useBackupImport, type PendingImport } from "./useBackupImport";

/** Oltre questi giorni l'ultimo backup è segnalato in arancione. */
const BACKUP_WARNING_DAYS = 30;

export function BackupSection() {
  const t = useT();
  const locale = useLocale();
  const lastBackup = usePrefs((state) => state.lastBackupDate);
  const exporter = useBackupExport();
  const importer = useBackupImport();
  const fileInput = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState<ExportFile | null>(null);
  const [importing, setImporting] = useState<PendingImport | null>(null);

  const startExport = async (kind: ExportKind) => {
    setExporting(await exporter.build(kind));
  };

  const exportActions = (exported: ExportFile): SheetAction[] => {
    const close = () => {
      setExporting(null);
    };
    const actions: SheetAction[] = [];
    if (exporter.canShare(exported.file)) {
      actions.push({
        label: t("share"),
        onSelect: () => {
          close();
          void exporter.share(exported);
        },
      });
    }
    actions.push(
      {
        label: t("downloadFile"),
        onSelect: () => {
          close();
          exporter.download(exported);
        },
      },
      {
        label: t("copyToClipboard"),
        onSelect: () => {
          close();
          void exporter.copy(exported);
        },
      },
    );
    return actions;
  };

  const age = lastBackup === null ? null : daysBetween(lastBackup, todayISO());
  const lastBackupText =
    age === null
      ? t("never")
      : age === 0
        ? t("today")
        : age === 1
          ? t("yesterday")
          : t("daysAgo", age);

  return (
    <>
      <ListGroup title={t("dataAndBackup")} footer={t("dataFooter")}>
        <SettingsRow
          icon={Share}
          color="var(--color-system-blue)"
          label={t("exportJson")}
          onClick={() => void startExport("json")}
        />
        <SettingsRow
          icon={Share}
          color="var(--color-system-teal)"
          label={t("exportCsv")}
          onClick={() => void startExport("csv")}
        />
        <SettingsRow
          icon={Download}
          color="var(--color-system-purple)"
          label={t("importBackup")}
          onClick={() => {
            fileInput.current?.click();
          }}
        />
        <SettingsRow
          icon={Info}
          color="var(--color-system-gray)"
          label={t("lastBackup")}
          value={lastBackupText}
          tone={age === null || age > BACKUP_WARNING_DAYS ? "warn" : undefined}
        />
      </ListGroup>

      <input
        ref={fileInput}
        className={styles.hidden}
        type="file"
        accept=".json,application/json"
        data-testid="import-input"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // si azzera il campo per poter scegliere di nuovo lo stesso file
          event.target.value = "";
          if (file) void importer.read(file).then(setImporting);
        }}
      />

      <ActionSheet
        open={exporting !== null}
        title={
          exporting?.kind === "csv" ? t("exportForExcel") : t("exportBackup")
        }
        message={
          exporting
            ? t(
                "fileSummary",
                exporting.file.name,
                formatKilobytes(exporting.file.size, locale),
              )
            : undefined
        }
        actions={exporting ? exportActions(exporting) : []}
        cancelLabel={t("cancel")}
        onCancel={() => {
          setExporting(null);
        }}
      />

      <ActionSheet
        open={importing !== null}
        title={t("importBackup")}
        message={
          importing
            ? t(
                "fileSummary",
                importing.fileName,
                t(
                  "importSummary",
                  t("nExpenses", importing.data.expenses.length),
                  t("nCategories", importing.data.categories.length),
                ),
              )
            : undefined
        }
        actions={
          importing
            ? [
                {
                  label: t("mergeData"),
                  onSelect: () => {
                    setImporting(null);
                    void importer.apply(importing, "merge");
                  },
                },
                {
                  label: t("replaceAll"),
                  destructive: true,
                  onSelect: () => {
                    setImporting(null);
                    void importer.apply(importing, "replace");
                  },
                },
              ]
            : []
        }
        cancelLabel={t("cancel")}
        onCancel={() => {
          setImporting(null);
        }}
      />
    </>
  );
}
