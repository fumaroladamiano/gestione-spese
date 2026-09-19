import { describe, expect, it } from "vitest";
import {
  checkDraft,
  draftFromExpense,
  isDraftDirty,
  newDraft,
  nextPaymentMethod,
} from "./expenseDraft";
import type { Expense } from "./types";

const expense: Expense = {
  id: "abc",
  amountCents: 1250,
  categoryId: "ristoranti",
  date: "2026-09-15",
  note: "Pizzeria",
  paymentMethod: "contanti",
  createdAt: "2026-09-15T20:00:00.000Z",
  updatedAt: "2026-09-15T20:00:00.000Z",
};

describe("bozza della spesa", () => {
  it("parte da oggi, senza categoria e con il metodo predefinito", () => {
    expect(newDraft("2026-09-16", "carta")).toEqual({
      amountInput: "",
      categoryId: null,
      date: "2026-09-16",
      note: "",
      paymentMethod: "carta",
      recurring: false,
    });
  });

  it("in modifica riparte dai valori salvati", () => {
    const draft = draftFromExpense(expense);
    expect(draft.amountInput).toBe("12.5");
    expect(checkDraft(draft)).toEqual({
      ok: true,
      input: {
        amountCents: 1250,
        categoryId: "ristoranti",
        date: "2026-09-15",
        note: "Pizzeria",
        paymentMethod: "contanti",
      },
    });
  });

  it("segnala prima l'importo mancante, poi la categoria", () => {
    const draft = newDraft("2026-09-16", "carta");
    expect(checkDraft(draft)).toEqual({ ok: false, missing: "amount" });
    expect(checkDraft({ ...draft, amountInput: "0." })).toEqual({
      ok: false,
      missing: "amount",
    });
    expect(checkDraft({ ...draft, amountInput: "3" })).toEqual({
      ok: false,
      missing: "category",
    });
  });

  it("riconosce le modifiche (non gli spazi o gli zeri finali)", () => {
    const initial = draftFromExpense(expense);
    expect(isDraftDirty({ ...initial, amountInput: "12.50" }, initial)).toBe(
      false,
    );
    expect(isDraftDirty({ ...initial, note: "Pizzeria " }, initial)).toBe(
      false,
    );
    expect(isDraftDirty({ ...initial, paymentMethod: "carta" }, initial)).toBe(
      true,
    );
    expect(isDraftDirty({ ...initial, amountInput: "13" }, initial)).toBe(true);
  });

  it("cicla i metodi di pagamento", () => {
    expect(nextPaymentMethod("carta")).toBe("contanti");
    expect(nextPaymentMethod("altro")).toBe("carta");
  });

  it("considera modificata la bozza se cambia la ripetizione", () => {
    const initial = draftFromExpense(expense, true);
    expect(initial.recurring).toBe(true);
    expect(isDraftDirty({ ...initial, recurring: false }, initial)).toBe(true);
    expect(nextPaymentMethod("contanti")).toBe("altro");
    expect(nextPaymentMethod("altro")).toBe("carta");
  });
});
