import { centsToInput, inputToCents, isValidAmount } from "./money";
import type { Expense, ExpenseInput, ISODate, PaymentMethod } from "./types";
import { PAYMENT_METHODS } from "./types";

/** Spesa in corso di inserimento o modifica nel foglio. */
export type ExpenseDraft = {
  /** Importo digitato sul tastierino ("12.5"), vedi money.ts. */
  amountInput: string;
  categoryId: string | null;
  date: ISODate;
  note: string;
  paymentMethod: PaymentMethod;
  /** "Ogni mese": la spesa è collegata a una regola ricorrente attiva. */
  recurring: boolean;
};

export function newDraft(
  today: ISODate,
  paymentMethod: PaymentMethod,
): ExpenseDraft {
  return {
    amountInput: "",
    categoryId: null,
    date: today,
    note: "",
    paymentMethod,
    recurring: false,
  };
}

/** `recurring`: true se la spesa è collegata a una regola ancora attiva. */
export function draftFromExpense(
  expense: Expense,
  recurring = false,
): ExpenseDraft {
  return {
    amountInput: centsToInput(expense.amountCents),
    categoryId: expense.categoryId,
    date: expense.date,
    note: expense.note,
    paymentMethod: expense.paymentMethod,
    recurring,
  };
}

/** true se l'utente ha cambiato qualcosa: chiudere il foglio chiede conferma. */
export function isDraftDirty(
  draft: ExpenseDraft,
  initial: ExpenseDraft,
): boolean {
  return (
    inputToCents(draft.amountInput) !== inputToCents(initial.amountInput) ||
    draft.categoryId !== initial.categoryId ||
    draft.date !== initial.date ||
    draft.note.trim() !== initial.note.trim() ||
    draft.paymentMethod !== initial.paymentMethod ||
    draft.recurring !== initial.recurring
  );
}

export type DraftCheck =
  | { ok: true; input: ExpenseInput }
  | { ok: false; missing: "amount" | "category" };

/** Pronta da salvare? Altrimenti indica cosa manca (la UI fa lo "shake" lì). */
export function checkDraft(draft: ExpenseDraft): DraftCheck {
  const amountCents = inputToCents(draft.amountInput);
  if (!isValidAmount(amountCents)) return { ok: false, missing: "amount" };
  if (draft.categoryId === null) return { ok: false, missing: "category" };
  return {
    ok: true,
    input: {
      amountCents,
      categoryId: draft.categoryId,
      date: draft.date,
      note: draft.note.trim(),
      paymentMethod: draft.paymentMethod,
    },
  };
}

/** Metodo successivo del chip: Carta → Contanti → Altro → Carta. */
export function nextPaymentMethod(method: PaymentMethod): PaymentMethod {
  const index = PAYMENT_METHODS.indexOf(method);
  return PAYMENT_METHODS[(index + 1) % PAYMENT_METHODS.length] ?? "carta";
}
