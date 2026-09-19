import { beforeEach, describe, expect, it } from "vitest";
import type { Category } from "../domain/types";
import { getCategories } from "./repositories/categories";
import { ensureBuiltinCategories } from "./seed";
import { resetDatabase, testDb } from "./testing";

const NOW = new Date("2026-09-16T10:00:00Z");

function custom(name: string): Category {
  return {
    id: `custom-${name}`,
    name,
    icon: "gift",
    colorLight: "#FFCC00",
    colorDark: "#FFD60A",
    builtin: false,
    archived: false,
    createdAt: "2026-05-01T10:00:00.000Z",
  };
}

describe("ensureBuiltinCategories", () => {
  beforeEach(async () => {
    await resetDatabase({ seed: false });
  });

  it("crea le 9 predefinite su un database vuoto", async () => {
    expect(await ensureBuiltinCategories(NOW)).toBe(9);
    const categories = await getCategories();
    expect(categories.map((c) => c.id)).toEqual([
      "spesa",
      "trasporti",
      "ristoranti",
      "casa",
      "salute",
      "svago",
      "abbonamenti",
      "lavoro",
      "altro",
    ]);
    expect(categories.every((c) => c.builtin && c.name === null)).toBe(true);
  });

  it("è idempotente: al secondo avvio non aggiunge nulla", async () => {
    await ensureBuiltinCategories(NOW);
    expect(await ensureBuiltinCategories(NOW)).toBe(0);
    expect(await testDb.categories.count()).toBe(9);
  });

  it("aggiunge Lavoro a un database esistente prima di Altro, senza toccare il resto", async () => {
    await ensureBuiltinCategories(NOW);
    await testDb.categories.delete("lavoro");
    await testDb.categories.update("spesa", {
      name: "Supermercato",
      archived: true,
    });
    await testDb.categories.add(custom("Palestra"));

    expect(await ensureBuiltinCategories(NOW)).toBe(1);
    const categories = await getCategories();
    expect(categories.map((c) => c.id).slice(-3)).toEqual([
      "lavoro",
      "altro",
      "custom-Palestra",
    ]);
    const spesa = categories.find((c) => c.id === "spesa");
    expect(spesa).toMatchObject({ name: "Supermercato", archived: true });
  });

  it("non aggiunge Lavoro se l'utente ha già una categoria Lavoro o Work", async () => {
    await testDb.categories.add(custom("lavoro"));
    await ensureBuiltinCategories(NOW);
    expect(await testDb.categories.get("lavoro")).toBeUndefined();

    await resetDatabase({ seed: false });
    await testDb.categories.add(custom("WORK"));
    await ensureBuiltinCategories(NOW);
    expect(await testDb.categories.get("lavoro")).toBeUndefined();
    expect(await testDb.categories.count()).toBe(9);
  });
});
