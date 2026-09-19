import { beforeEach, describe, expect, it } from "vitest";
import type { ExpenseInput } from "../../domain/types";
import { DataError } from "../errors";
import { resetDatabase, testDb } from "../testing";
import {
  addExpense,
  deleteExpense,
  getExpensesBetween,
  findCategoryForNote,
  getExpensesFiltered,
  getOldestExpenseDate,
  getRecentExpenses,
  restoreExpense,
  updateExpense,
} from "./expenses";

const NOW = new Date(2026, 8, 16, 12, 0); // 16 settembre 2026, ora locale

const input: ExpenseInput = {
  amountCents: 1250,
  categoryId: "ristoranti",
  date: "2026-09-16",
  note: "  Pizzeria  ",
  paymentMethod: "carta",
};

async function expectError(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toBeInstanceOf(DataError);
  await expect(promise).rejects.toMatchObject({ code });
}

describe("repository delle spese", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("registra una spesa con id, date di creazione e nota ripulita", async () => {
    const expense = await addExpense(input, NOW);
    expect(expense.id).toMatch(/^[0-9a-f]{32}$/);
    expect(expense.note).toBe("Pizzeria");
    expect(expense.createdAt).toBe(NOW.toISOString());
    expect(expense.updatedAt).toBe(NOW.toISOString());
    expect(await testDb.expenses.get(expense.id)).toEqual(expense);
  });

  it("rifiuta importi non validi", async () => {
    await expectError(
      addExpense({ ...input, amountCents: 0 }, NOW),
      "invalidAmount",
    );
    await expectError(
      addExpense({ ...input, amountCents: -100 }, NOW),
      "invalidAmount",
    );
    await expectError(
      addExpense({ ...input, amountCents: 12.5 }, NOW),
      "invalidAmount",
    );
    await expectError(
      addExpense({ ...input, amountCents: 100_000_000 }, NOW),
      "invalidAmount",
    );
    expect(await testDb.expenses.count()).toBe(0);
  });

  it("rifiuta date future o non valide", async () => {
    await expectError(
      addExpense({ ...input, date: "2026-09-17" }, NOW),
      "futureDate",
    );
    await expectError(
      addExpense({ ...input, date: "2026-02-30" }, NOW),
      "invalidDate",
    );
  });

  it("rifiuta note troppo lunghe e categorie sconosciute o archiviate", async () => {
    await expectError(
      addExpense({ ...input, note: "x".repeat(41) }, NOW),
      "invalidNote",
    );
    await expectError(
      addExpense({ ...input, categoryId: "boh" }, NOW),
      "unknownCategory",
    );
    await testDb.categories.update("svago", { archived: true });
    await expectError(
      addExpense({ ...input, categoryId: "svago" }, NOW),
      "archivedCategory",
    );
  });

  it("modifica una spesa mantenendo la data di creazione", async () => {
    const created = await addExpense(input, NOW);
    const later = new Date(2026, 8, 16, 18, 0);
    const updated = await updateExpense(
      created.id,
      { ...input, amountCents: 1500, paymentMethod: "contanti" },
      later,
    );
    expect(updated).toMatchObject({
      id: created.id,
      amountCents: 1500,
      paymentMethod: "contanti",
      createdAt: created.createdAt,
      updatedAt: later.toISOString(),
    });
  });

  it("permette di modificare una spesa la cui categoria è stata archiviata", async () => {
    const created = await addExpense({ ...input, categoryId: "svago" }, NOW);
    await testDb.categories.update("svago", { archived: true });
    const updated = await updateExpense(
      created.id,
      {
        ...input,
        categoryId: "svago",
        amountCents: 999,
      },
      NOW,
    );
    expect(updated.amountCents).toBe(999);
  });

  it("elimina e ripristina la stessa spesa (Annulla)", async () => {
    const created = await addExpense(input, NOW);
    const removed = await deleteExpense(created.id);
    expect(removed).toEqual(created);
    expect(await testDb.expenses.count()).toBe(0);
    if (removed) await restoreExpense(removed);
    expect(await testDb.expenses.get(created.id)).toEqual(created);
  });

  it("ordina dal giorno più recente e, nello stesso giorno, dall'ultima inserita", async () => {
    const a = await addExpense(
      { ...input, date: "2026-09-15" },
      new Date(2026, 8, 16, 9),
    );
    const b = await addExpense(input, new Date(2026, 8, 16, 10));
    const c = await addExpense(input, new Date(2026, 8, 16, 11));
    const d = await addExpense({ ...input, date: "2026-08-31" }, NOW);

    const september = await getExpensesBetween("2026-09-01", "2026-09-30");
    expect(september.map((e) => e.id)).toEqual([c.id, b.id, a.id]);
    const recent = await getRecentExpenses(2);
    expect(recent.map((e) => e.id)).toEqual([c.id, b.id]);
    expect(
      (await getExpensesBetween("2026-08-01", "2026-08-31")).map((e) => e.id),
    ).toEqual([d.id]);
  });

  it("filtra per categorie e intervallo con l'indice composto", async () => {
    const a = await addExpense(
      { ...input, categoryId: "spesa", date: "2026-09-10" },
      NOW,
    );
    const b = await addExpense(
      { ...input, categoryId: "casa", date: "2026-09-12" },
      NOW,
    );
    await addExpense(
      { ...input, categoryId: "svago", date: "2026-09-11" },
      NOW,
    );
    await addExpense(
      { ...input, categoryId: "spesa", date: "2026-08-20" },
      NOW,
    );

    const result = await getExpensesFiltered("2026-09-01", "2026-09-30", [
      "spesa",
      "casa",
    ]);
    expect(result.map((e) => e.id)).toEqual([b.id, a.id]);
    expect(
      await getExpensesFiltered("2026-09-01", "2026-09-30", []),
    ).toHaveLength(3);
    expect(await getOldestExpenseDate()).toBe("2026-08-20");
  });

  it("suggerisce la categoria dell'ultima spesa con la stessa nota", async () => {
    await addExpense(
      { ...input, categoryId: "spesa", note: "Caffè", date: "2026-09-01" },
      NOW,
    );
    await addExpense(
      { ...input, categoryId: "ristoranti", note: "caffe", date: "2026-09-10" },
      NOW,
    );
    expect(await findCategoryForNote("CAFFÈ")).toBe("ristoranti");
    expect(await findCategoryForNote("benzina")).toBeNull();
    expect(await findCategoryForNote("c")).toBeNull();
  });
});
