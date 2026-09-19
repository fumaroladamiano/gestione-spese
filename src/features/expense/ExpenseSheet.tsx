import { useUi } from "../../stores/ui";
import { ExpenseForm } from "./ExpenseForm";
import { useDeleteExpense } from "./useDeleteExpense";
import { useExpenseForEdit } from "./useExpenseForEdit";

/** Foglio "Nuova / Modifica spesa", aperto dal "+" o toccando una riga. */
export function ExpenseSheet() {
  const { open, session, expenseId } = useUi((state) => state.expenseSheet);
  const close = useUi((state) => state.closeExpenseSheet);
  const deleteWithUndo = useDeleteExpense();
  const expense = useExpenseForEdit(expenseId);

  // in modifica il foglio si apre solo quando la spesa è caricata
  if (expenseId !== null && !expense) return null;

  return (
    <ExpenseForm
      key={session}
      open={open}
      expense={expense ?? null}
      onClose={close}
      onDelete={(id) => {
        close();
        // si elimina dopo la chiusura del foglio, così il toast "Annulla" è visibile
        window.setTimeout(() => void deleteWithUndo(id), 320);
      }}
    />
  );
}
