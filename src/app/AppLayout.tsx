import { Outlet } from "react-router";
import { useEffect } from "react";
import { ExpenseSheet } from "../features/expense/ExpenseSheet";
import { InstallGuide } from "../features/install/InstallGuide";
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
      <InstallGuide />
      <ToastHost />
      <UpdatePrompt />
    </>
  );
}
