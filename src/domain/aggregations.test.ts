import { describe, expect, it } from "vitest";
import {
  averagePerDay,
  compareWithPreviousMonth,
  dailyTotals,
  elapsedDays,
  groupByDay,
  lastDaysTotals,
  sumCents,
  totalsByCategory,
} from "./aggregations";
import type { Expense } from "./types";

let counter = 0;
function expense(
  date: string,
  amountCents: number,
  categoryId = "spesa",
): Expense {
  counter += 1;
  return {
    id: `e${String(counter)}`,
    amountCents,
    categoryId,
    date,
    note: "",
    paymentMethod: "carta",
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
  };
}

describe("totali", () => {
  it("somma in centesimi senza errori di arrotondamento", () => {
    expect(
      sumCents([expense("2026-09-01", 10), expense("2026-09-01", 20)]),
    ).toBe(30);
    expect(sumCents([])).toBe(0);
  });

  it("raggruppa per giorno mantenendo l'ordine", () => {
    const list = [
      expense("2026-09-16", 2090),
      expense("2026-09-16", 250),
      expense("2026-09-15", 6000),
    ];
    const groups = groupByDay(list);
    expect(
      groups.map((g) => [g.date, g.totalCents, g.expenses.length]),
    ).toEqual([
      ["2026-09-16", 2340, 2],
      ["2026-09-15", 6000, 1],
    ]);
  });

  it("calcola il totale per categoria con le quote", () => {
    const totals = totalsByCategory([
      expense("2026-09-01", 3000, "spesa"),
      expense("2026-09-02", 1000, "casa"),
      expense("2026-09-03", 1000, "spesa"),
    ]);
    expect(totals).toEqual([
      { categoryId: "spesa", totalCents: 4000, share: 0.8 },
      { categoryId: "casa", totalCents: 1000, share: 0.2 },
    ]);
    expect(totalsByCategory([])).toEqual([]);
  });

  it("calcola i totali giornalieri del mese", () => {
    const totals = dailyTotals(
      [
        expense("2026-02-01", 100),
        expense("2026-02-28", 50),
        expense("2026-03-01", 99),
      ],
      "2026-02",
    );
    expect(totals).toHaveLength(28);
    expect(totals[0]).toBe(100);
    expect(totals[27]).toBe(50);
  });

  it("calcola gli ultimi 7 giorni con oggi per ultimo", () => {
    const totals = lastDaysTotals(
      [
        expense("2026-09-16", 500),
        expense("2026-09-10", 300),
        expense("2026-09-09", 999),
      ],
      "2026-09-16",
      7,
    );
    expect(totals).toEqual([300, 0, 0, 0, 0, 0, 500]);
  });
});

describe("media giornaliera", () => {
  it("usa i giorni trascorsi nel mese in corso e il mese intero per quelli chiusi", () => {
    expect(elapsedDays("2026-09", "2026-09-16")).toBe(16);
    expect(elapsedDays("2026-08", "2026-09-16")).toBe(31);
    expect(elapsedDays("2026-10", "2026-09-16")).toBe(0);
    expect(averagePerDay(128460, 16)).toBe(8029);
    expect(averagePerDay(1000, 0)).toBe(0);
  });
});

describe("confronto con il mese precedente", () => {
  const august = [
    expense("2026-08-05", 10000),
    expense("2026-08-16", 5000),
    expense("2026-08-20", 90000),
  ];

  it("per il mese in corso confronta lo stesso periodo", () => {
    const comparison = compareWithPreviousMonth(
      "2026-09",
      18000,
      "2026-08",
      august,
      "2026-09-16",
    );
    expect(comparison).toEqual({
      previousMonth: "2026-08",
      previousCents: 15000,
      change: 0.2,
      samePeriod: true,
    });
  });

  it("per un mese chiuso confronta il mese intero", () => {
    const comparison = compareWithPreviousMonth(
      "2026-09",
      52500,
      "2026-08",
      august,
      "2026-10-03",
    );
    expect(comparison.previousCents).toBe(105000);
    expect(comparison.change).toBe(-0.5);
    expect(comparison.samePeriod).toBe(false);
  });

  it("non calcola la variazione se il mese precedente è vuoto", () => {
    expect(
      compareWithPreviousMonth("2026-09", 5000, "2026-08", [], "2026-09-16")
        .change,
    ).toBeNull();
  });
});
