import { beforeEach, describe, expect, it } from "vitest";
import { buildBackup } from "../../domain/backup";
import { parseBackup } from "../../domain/backupSchema";
import { resetDatabase, testDb } from "../testing";
import { mergeData, readAllData, replaceAllData } from "./backup";
import { createCategory } from "./categories";
import { addExpense } from "./expenses";
import { setBudgetCents } from "./settings";

const NOW = new Date(2026, 8, 16, 12);

async function seedSample() {
  const palestra = await createCategory(
    "Palestra",
    { icon: "dumbbell", colorLight: "#FFCC00", colorDark: "#FFD60A" },
    NOW,
  );
  await addExpense(
    {
      amountCents: 3900,
      categoryId: palestra.id,
      date: "2026-09-01",
      note: "Mensile",
      paymentMethod: "carta",
    },
    NOW,
  );
  await addExpense(
    {
      amountCents: 1250,
      categoryId: "ristoranti",
      date: "2026-09-16",
      note: "Pizzeria",
      paymentMethod: "contanti",
    },
    NOW,
  );
  await setBudgetCents(150000);
}

describe("backup nel database", () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedSample();
  });

  it("esporta e con Sostituisci tutto ripristina dati identici", async () => {
    const before = await readAllData();
    const text = JSON.stringify(buildBackup(before, NOW));

    await resetDatabase();
    const parsed = parseBackup(text);
    expect(parsed).not.toBeNull();
    if (parsed) await replaceAllData(parsed);

    const after = await readAllData();
    expect(after.expenses).toEqual(before.expenses);
    expect(after.budgetCents).toBe(150000);
    expect(after.categories.map((c) => c.id).sort()).toEqual(
      before.categories.map((c) => c.id).sort(),
    );
  });

  it("Unisci non duplica le spese già presenti e aggiunge le nuove", async () => {
    const backup = await readAllData();
    expect(await mergeData(backup)).toBe(0);
    expect(await testDb.expenses.count()).toBe(2);

    const [first] = backup.expenses;
    if (!first) throw new Error("dati di prova mancanti");
    const extra = {
      ...backup,
      expenses: [
        ...backup.expenses,
        {
          ...first,
          id: "nuova",
          amountCents: 700,
          note: "Caffè",
        },
      ],
    };
    expect(await mergeData(extra)).toBe(1);
    expect(await testDb.expenses.count()).toBe(3);
  });

  it("Sostituisci tutto rimette le predefinite mancanti", async () => {
    const backup = await readAllData();
    await replaceAllData({
      ...backup,
      categories: backup.categories.filter((c) => c.id !== "lavoro"),
    });
    expect(await testDb.categories.get("lavoro")).toBeDefined();
  });
});
