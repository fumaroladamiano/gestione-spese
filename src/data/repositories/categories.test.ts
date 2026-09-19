import { beforeEach, describe, expect, it } from "vitest";
import { DataError } from "../errors";
import { resetDatabase, testDb } from "../testing";
import {
  archiveCategory,
  createCategory,
  deleteCategory,
  getCategories,
  restoreCategory,
  updateCategory,
} from "./categories";
import { addExpense } from "./expenses";

const STYLE = { icon: "dumbbell", colorLight: "#FFCC00", colorDark: "#FFD60A" };
const NOW = new Date(2026, 8, 16, 12);

async function expectError(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toBeInstanceOf(DataError);
  await expect(promise).rejects.toMatchObject({ code });
}

describe("repository delle categorie", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("crea una categoria personalizzata in fondo all'elenco", async () => {
    const created = await createCategory(" Palestra ", STYLE, NOW);
    expect(created).toMatchObject({
      name: "Palestra",
      builtin: false,
      archived: false,
    });
    const all = await getCategories();
    expect(all.at(-1)?.id).toBe(created.id);
  });

  it("rifiuta nomi vuoti, troppo lunghi o già usati (anche tradotti)", async () => {
    await expectError(createCategory("   ", STYLE, NOW), "invalidCategoryName");
    await expectError(
      createCategory("x".repeat(21), STYLE, NOW),
      "invalidCategoryName",
    );
    await createCategory("Palestra", STYLE, NOW);
    await expectError(
      createCategory("PALESTRA", STYLE, NOW),
      "duplicateCategoryName",
    );
    await expectError(
      createCategory("groceries", STYLE, NOW),
      "duplicateCategoryName",
    );
    await expectError(
      createCategory("Spesa", STYLE, NOW),
      "duplicateCategoryName",
    );
  });

  it("rifiuta icone o colori non validi", async () => {
    await expectError(
      createCategory("Viaggi", { ...STYLE, icon: "ShoppingCart" }, NOW),
      "invalidCategoryStyle",
    );
  });

  it("ammette al massimo 15 categorie attive", async () => {
    for (let i = 0; i < 6; i++)
      await createCategory(`Extra ${String(i)}`, STYLE, NOW);
    await expectError(createCategory("Troppe", STYLE, NOW), "categoryLimit");
    await archiveCategory("svago");
    await createCategory("Troppe", STYLE, NOW);
    await expectError(restoreCategory("svago"), "categoryLimit");
  });

  it("archivia e ripristina, ma non archivia Altro", async () => {
    await archiveCategory("svago");
    expect((await testDb.categories.get("svago"))?.archived).toBe(true);
    await restoreCategory("svago");
    expect((await testDb.categories.get("svago"))?.archived).toBe(false);
    await expectError(archiveCategory("altro"), "protectedCategory");
  });

  it("elimina solo le personalizzate senza spese", async () => {
    const palestra = await createCategory("Palestra", STYLE, NOW);
    await addExpense(
      {
        amountCents: 3900,
        categoryId: palestra.id,
        date: "2026-09-01",
        note: "",
        paymentMethod: "carta",
      },
      NOW,
    );
    await expectError(deleteCategory(palestra.id), "categoryInUse");
    await expectError(deleteCategory("svago"), "protectedCategory");

    const vuota = await createCategory("Vuota", STYLE, NOW);
    await deleteCategory(vuota.id);
    expect(await testDb.categories.get(vuota.id)).toBeUndefined();
  });

  it("lascia tradotto il nome di una predefinita salvata senza modificarlo", async () => {
    const style = { icon: "cart", colorLight: "#007AFF", colorDark: "#0A84FF" };
    const same = await updateCategory("spesa", "Groceries", style);
    expect(same.name).toBeNull();
    expect(same.colorLight).toBe("#007AFF");

    const renamed = await updateCategory("spesa", "Supermercato", style);
    expect(renamed.name).toBe("Supermercato");
  });
});
