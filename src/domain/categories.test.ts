import { describe, expect, it } from "vitest";
import {
  BUILTIN_CATEGORIES,
  sameCategoryName,
  sortCategories,
} from "./categories";
import type { Category } from "./types";

function category(id: string, createdAt: string, builtin = false): Category {
  return {
    id,
    name: builtin ? null : id,
    icon: "gift",
    colorLight: "#000000",
    colorDark: "#000000",
    builtin,
    archived: false,
    createdAt,
  };
}

describe("categorie", () => {
  it("elenca 9 predefinite con Lavoro e Altro ultima", () => {
    expect(BUILTIN_CATEGORIES.map((c) => c.id)).toEqual([
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
  });

  it("mostra le predefinite in ordine fisso e poi le personalizzate per data", () => {
    const sorted = sortCategories([
      category("palestra", "2026-09-10T10:00:00.000Z"),
      category("altro", "2026-01-01T00:00:00.000Z", true),
      category("viaggi", "2026-09-01T10:00:00.000Z"),
      // Lavoro aggiunta dopo dal seed: va comunque prima di Altro
      category("lavoro", "2026-09-15T00:00:00.000Z", true),
      category("spesa", "2026-01-01T00:00:00.000Z", true),
    ]);
    expect(sorted.map((c) => c.id)).toEqual([
      "spesa",
      "lavoro",
      "altro",
      "viaggi",
      "palestra",
    ]);
  });

  it("confronta i nomi senza maiuscole e spazi ai lati", () => {
    expect(sameCategoryName(" Palestra ", "palestra")).toBe(true);
    expect(sameCategoryName("Casa", "Cassa")).toBe(false);
  });
});
