import { Outlet } from "react-router";
import { ExpenseSheet } from "../features/expense/ExpenseSheet";
import { useUi } from "../stores/ui";
import styles from "./AppLayout.module.css";
import { TabBar } from "./TabBar";
import { ToastHost } from "./ToastHost";
import { UpdatePrompt } from "./UpdatePrompt";

/** Struttura comune: pagina della tab attiva, tab bar sospesa, fogli, toast e aggiornamenti. */
export function AppLayout() {
  const openNewExpense = useUi((state) => state.openNewExpense);

  return (
    <>
      <div className={styles.shell}>
        <Outlet />
        <TabBar onAdd={openNewExpense} />
      </div>
      <ExpenseSheet />
      <ToastHost />
      <UpdatePrompt />
    </>
  );
}
