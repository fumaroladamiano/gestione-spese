import { Outlet } from "react-router";
import { TabBar } from "./TabBar";
import { UpdatePrompt } from "./UpdatePrompt";

/** Struttura comune: pagina della tab attiva, tab bar sospesa e avviso di nuova versione. */
export function AppLayout() {
  // Il foglio "Nuova spesa" arriva nella fase 1 (step 1.4): per ora il "+" non apre nulla
  const openNewExpense = () => undefined;

  return (
    <>
      <Outlet />
      <TabBar onAdd={openNewExpense} />
      <UpdatePrompt />
    </>
  );
}
