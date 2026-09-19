import { Outlet } from "react-router";
import { TabBar } from "./TabBar";

/** Struttura comune: pagina della tab attiva e tab bar sospesa (fogli e toast dalla fase 1). */
export function AppLayout() {
  // Il foglio "Nuova spesa" arriva nella fase 1 (step 1.4): per ora il "+" non apre nulla
  const openNewExpense = () => undefined;

  return (
    <>
      <Outlet />
      <TabBar onAdd={openNewExpense} />
    </>
  );
}
