import { describe, expect, it } from "vitest";
import { filtersFromSearch } from "./filterParams";
import {
  applyFilters,
  changeMonth,
  defaultFilters,
  filtersToSearch,
  isDefaultFilters,
  normalizeSearch,
  toggleCategory,
  toggleDay,
  type HistoryFilters,
} from "./filters";
import type { Expense } from "./types";

const TODAY = "2026-09-16";

function expense(
  id: string,
  date: string,
  categoryId: string,
  note = "",
): Expense {
  return {
    id,
    amountCents: 1000,
    categoryId,
    date,
    note,
    paymentMethod: "carta",
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
  };
}

const list = [
  expense("a", "2026-09-16", "spesa", "Esselunga"),
  expense("b", "2026-09-15", "ristoranti", "Caffè"),
  expense("c", "2026-09-02", "casa"),
  expense("d", "2026-08-30", "spesa", "Coop"),
];

const ids = (filters: HistoryFilters) =>
  applyFilters(list, filters).map((e) => e.id);

describe("filtri dello storico", () => {
  it("parte dal mese corrente senza altri filtri", () => {
    const filters = defaultFilters(TODAY);
    expect(filters).toEqual({
      month: "2026-09",
      categoryIds: [],
      day: null,
      query: "",
    });
    expect(isDefaultFilters(filters, TODAY)).toBe(true);
    expect(ids(filters)).toEqual(["a", "b", "c"]);
  });

  it("combina mese, categorie e giorno in AND e più categorie in OR", () => {
    const base = defaultFilters(TODAY);
    expect(ids({ ...base, categoryIds: ["spesa", "casa"] })).toEqual([
      "a",
      "c",
    ]);
    expect(ids({ ...base, categoryIds: ["spesa"], day: "2026-09-15" })).toEqual(
      [],
    );
    expect(ids({ ...base, month: null, categoryIds: ["spesa"] })).toEqual([
      "a",
      "d",
    ]);
  });

  it("cerca nelle note senza maiuscole né accenti", () => {
    const base = { ...defaultFilters(TODAY), month: null };
    expect(ids({ ...base, query: "CAFFE" })).toEqual(["b"]);
    expect(ids({ ...base, query: "  coop " })).toEqual(["d"]);
    expect(normalizeSearch("Perché")).toBe("perche");
  });

  it("scegliere un giorno imposta il mese; toccarlo di nuovo lo toglie", () => {
    const withDay = toggleDay(
      { ...defaultFilters(TODAY), month: null },
      "2026-08-30",
    );
    expect(withDay).toMatchObject({ month: "2026-08", day: "2026-08-30" });
    expect(toggleDay(withDay, "2026-08-30").day).toBeNull();
  });

  it("cambiare mese azzera il giorno se non appartiene al nuovo mese", () => {
    const withDay = toggleDay(defaultFilters(TODAY), "2026-09-15");
    expect(changeMonth(withDay, "2026-08")).toMatchObject({
      month: "2026-08",
      day: null,
    });
    expect(changeMonth(withDay, "2026-09").day).toBe("2026-09-15");
    expect(changeMonth(withDay, null)).toMatchObject({
      month: null,
      day: null,
    });
  });

  it("aggiunge e toglie categorie", () => {
    const one = toggleCategory(defaultFilters(TODAY), "spesa");
    expect(one.categoryIds).toEqual(["spesa"]);
    expect(toggleCategory(one, "spesa").categoryIds).toEqual([]);
  });
});

describe("filtri nell'indirizzo", () => {
  it("scrive e rilegge gli stessi filtri", () => {
    const filters: HistoryFilters = {
      month: "2026-08",
      categoryIds: ["spesa", "casa"],
      day: "2026-08-30",
      query: "coop",
    };
    const search = filtersToSearch(filters, TODAY);
    expect(search).toBe("month=2026-08&cat=spesa%2Ccasa&day=2026-08-30&q=coop");
    expect(filtersFromSearch(new URLSearchParams(search), TODAY)).toEqual(
      filters,
    );
  });

  it("non scrive nulla per i filtri predefiniti e usa month=all per tutti i mesi", () => {
    expect(filtersToSearch(defaultFilters(TODAY), TODAY)).toBe("");
    const all = { ...defaultFilters(TODAY), month: null };
    expect(filtersToSearch(all, TODAY)).toBe("month=all");
    expect(
      filtersFromSearch(new URLSearchParams("month=all"), TODAY).month,
    ).toBeNull();
  });

  it("scarta i valori non validi", () => {
    const filters = filtersFromSearch(
      new URLSearchParams(
        "month=2026-13&cat=spesa,<script>&day=2026-02-30&q=" + "x".repeat(50),
      ),
      TODAY,
    );
    expect(filters).toEqual({
      month: "2026-09",
      categoryIds: ["spesa"],
      day: null,
      query: "",
    });
    // giorno futuro scartato
    expect(
      filtersFromSearch(new URLSearchParams("day=2026-09-20"), TODAY).day,
    ).toBeNull();
  });
});
