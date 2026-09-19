import { describe, expect, it } from "vitest";
import type { Category } from "../domain/types";
import {
  builtinNamesInAllLanguages,
  categoryDisplayName,
} from "./categoryNames";
import { createT } from "./index";

const base: Category = {
  id: "spesa",
  name: null,
  icon: "cart",
  colorLight: "#34C759",
  colorDark: "#30D158",
  builtin: true,
  archived: false,
  createdAt: "2026-09-01T00:00:00.000Z",
};

describe("categoryDisplayName", () => {
  it("traduce le predefinite non rinominate", () => {
    expect(categoryDisplayName(base, createT("it"))).toBe("Spesa");
    expect(categoryDisplayName(base, createT("en"))).toBe("Groceries");
  });

  it("non traduce le predefinite rinominate", () => {
    const renamed = { ...base, name: "Supermercato" };
    expect(categoryDisplayName(renamed, createT("en"))).toBe("Supermercato");
  });

  it("non traduce le categorie create dall'utente", () => {
    const custom = { ...base, id: "abc", name: "Palestra", builtin: false };
    expect(categoryDisplayName(custom, createT("en"))).toBe("Palestra");
  });

  it("conosce il nome delle predefinite in tutte le lingue", () => {
    expect(builtinNamesInAllLanguages("lavoro")).toEqual(["Lavoro", "Work"]);
  });
});
