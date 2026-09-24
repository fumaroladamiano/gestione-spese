import { beforeEach, describe, expect, it } from "vitest";
import type { ExpenseInput } from "../../domain/types";
import { resetDatabase, testDb } from "../testing";
import { archiveCategory } from "./categories";
import {
  addRecurringExpense,
  countActiveRulesInCategory,
  deleteRule,
  generateDueExpenses,
  getRecurringRules,
  setRuleActive,
  updateRule,
} from "./recurringRules";

const netflix: ExpenseInput = {
  amountCents: 1299,
  categoryId: "abbonamenti",
  date: "2026-06-05",
  note: "Netflix",
  paymentMethod: "carta",
};

describe("regole ricorrenti nel database", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("registra la spesa e la regola insieme", async () => {
    const expense = await addRecurringExpense(
      netflix,
      new Date(2026, 5, 5, 20),
    );
    const [rule] = await getRecurringRules();
    expect(rule).toMatchObject({
      dayOfMonth: 5,
      lastGeneratedMonth: "2026-06",
    });
    expect(expense.recurringRuleId).toBe(rule?.id);
  });

  it("genera i mesi arretrati una sola volta, anche riaprendo più volte", async () => {
    await addRecurringExpense(netflix, new Date(2026, 5, 5, 20));
    const september = new Date(2026, 8, 16, 9);
    expect(await generateDueExpenses(september)).toBe(3);
    expect(await generateDueExpenses(september)).toBe(0);
    expect(await generateDueExpenses(new Date(2026, 8, 30, 9))).toBe(0);

    const dates = (await testDb.expenses.orderBy("date").toArray()).map(
      (e) => e.date,
    );
    expect(dates).toEqual([
      "2026-06-05",
      "2026-07-05",
      "2026-08-05",
      "2026-09-05",
    ]);
  });

  it("una regola sospesa non genera spese e riattivata riparte dal mese corrente", async () => {
    await addRecurringExpense(netflix, new Date(2026, 5, 5, 20));
    const [rule] = await getRecurringRules();
    if (!rule) throw new Error("regola mancante");
    await setRuleActive(rule.id, false);
    expect(await generateDueExpenses(new Date(2026, 8, 16))).toBe(0);

    await setRuleActive(rule.id, true, new Date(2026, 8, 16));
    expect(await generateDueExpenses(new Date(2026, 8, 16))).toBe(1);
  });

  it("modifica la regola senza toccare le spese già create", async () => {
    await addRecurringExpense(netflix, new Date(2026, 5, 5, 20));
    await generateDueExpenses(new Date(2026, 8, 16, 9));
    const [rule] = await getRecurringRules();
    if (!rule) throw new Error("regola mancante");

    const updated = await updateRule(
      rule.id,
      {
        amountCents: 1599,
        note: "Netflix famiglia",
        paymentMethod: "contanti",
        dayOfMonth: 12,
      },
      false,
      new Date(2026, 8, 20, 9),
    );
    expect(updated).toBe(0);
    const [saved] = await getRecurringRules();
    expect(saved).toMatchObject({ amountCents: 1599, dayOfMonth: 12 });
    const amounts = (await testDb.expenses.toArray()).map((e) => e.amountCents);
    expect(amounts).toEqual([1299, 1299, 1299, 1299]);
  });

  it("applicando l'importo anche alle spese vecchie le aggiorna tutte", async () => {
    await addRecurringExpense(netflix, new Date(2026, 5, 5, 20));
    await generateDueExpenses(new Date(2026, 8, 16, 9));
    const [rule] = await getRecurringRules();
    if (!rule) throw new Error("regola mancante");

    const updated = await updateRule(
      rule.id,
      {
        amountCents: 1599,
        note: rule.note,
        paymentMethod: rule.paymentMethod,
        dayOfMonth: rule.dayOfMonth,
      },
      true,
      new Date(2026, 8, 20, 9),
    );
    expect(updated).toBe(4);
    const amounts = (await testDb.expenses.toArray()).map((e) => e.amountCents);
    expect(amounts).toEqual([1599, 1599, 1599, 1599]);
  });

  it("archiviando la categoria sospende le sue regole", async () => {
    await addRecurringExpense(netflix, new Date(2026, 5, 5, 20));
    expect(await countActiveRulesInCategory("abbonamenti")).toBe(1);

    await archiveCategory("abbonamenti", new Date(2026, 8, 20, 9));
    expect(await countActiveRulesInCategory("abbonamenti")).toBe(0);
    expect(await generateDueExpenses(new Date(2026, 8, 16, 9))).toBe(0);
  });

  it("eliminare la regola lascia le spese senza collegamento", async () => {
    const expense = await addRecurringExpense(
      netflix,
      new Date(2026, 5, 5, 20),
    );
    const [rule] = await getRecurringRules();
    if (!rule) throw new Error("regola mancante");
    await deleteRule(rule.id);
    expect(await getRecurringRules()).toEqual([]);
    const stored = await testDb.expenses.get(expense.id);
    expect(stored).toBeDefined();
    expect(stored?.recurringRuleId).toBeUndefined();
  });
});
