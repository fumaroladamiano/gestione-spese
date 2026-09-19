import { Outlet } from "react-router";
import { useEffect } from "react";
import { ExpenseSheet } from "../features/expense/ExpenseSheet";
import { useExpenseCount } from "../features/expense/useExpenseCount";
import { InstallGuide } from "../features/install/InstallGuide";
import { useBackupExport } from "../features/settings/useBackupExport";
import { useT } from "../i18n/useT";
import { isStandalone } from "../features/install/useStandalone";
import { usePrefs } from "../stores/prefs";
import { useUi } from "../stores/ui";
import styles from "./AppLayout.module.css";
import { TabBar } from "./TabBar";
import { ToastHost } from "./ToastHost";
import { UpdatePrompt } from "./UpdatePrompt";

/** Struttura comune: pagina della tab attiva, tab bar sospesa, fogli, toast e aggiornamenti. */
export function AppLayout() {
  const openNewExpense = useUi((state) => state.openNewExpense);
  const setInstallGuideOpen = useUi((state) => state.setInstallGuideOpen);
  const t = useT();
  const exporter = useBackupExport();
  const expenseCount = useExpenseCount();

  // spese già inserite in Safari: prima di installare conviene esportarle (R2)
  const exportBeforeInstall = async () => {
    const exported = await exporter.build("json");
    if (exporter.canShare(exported.file)) await exporter.share(exported);
    else exporter.download(exported);
  };

  // al primo accesso da Safari la guida all'installazione si apre da sola (D11)
  useEffect(() => {
    if (!isStandalone() && !usePrefs.getState().installGuideSeen) {
      const timer = window.setTimeout(() => {
        setInstallGuideOpen(true);
      }, 700);
      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [setInstallGuideOpen]);

  return (
    <>
      <div className={styles.shell}>
        <Outlet />
        <TabBar onAdd={openNewExpense} />
      </div>
      <ExpenseSheet />
      <InstallGuide
        extraAction={
          expenseCount > 0 && !isStandalone()
            ? {
                label: t("installExportFirst"),
                onClick: () => void exportBeforeInstall(),
              }
            : undefined
        }
      />
      <ToastHost />
      <UpdatePrompt />
    </>
  );
}
