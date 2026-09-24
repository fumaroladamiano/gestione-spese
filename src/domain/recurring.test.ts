import { describe, expect, it } from "vitest";
import {
  dueDates,
  isValidDayOfMonth,
  occurrenceDate,
  resumedRule,
  ruleFromExpense,
  ruleWithChanges,
} from "./recurring";
import type { RecurringRule } from "./types";

const NOW = new Date("2026-09-16T10:00:00.000Z");

function rule(overrides: Partial<RecurringRule> = {}): RecurringRule {
  return {
    id: "r1",
    amountCents: 1299,
    categoryId: "abbonamenti",
    note: "Netflix",
    paymentMethod: "carta",
    dayOfMonth: 5,
    active: true,
    lastGeneratedMonth: "2026-08",
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...overrides,
  };
}

describe("spese ricorrenti", () => {
  it("crea la regola dalla spesa segnata Ogni mese, partendo dal mese dopo", () => {
    const created = ruleFromExpense(
      {
        amountCents: 1299,
        categoryId: "abbonamenti",
        note: "Netflix",
        paymentMethod: "carta",
        date: "2026-09-05",
      },
      "r1",
      NOW,
    );
    expect(created).toMatchObject({
      dayOfMonth: 5,
      active: true,
      lastGeneratedMonth: "2026-09",
    });
    expect(dueDates(created, "2026-09-16")).toEqual([]);
  });

  it("genera la spesa del mese solo quando il giorno è arrivato", () => {
    expect(dueDates(rule({ dayOfMonth: 20 }), "2026-09-16")).toEqual([]);
    expect(dueDates(rule({ dayOfMonth: 16 }), "2026-09-16")).toEqual([
      "2026-09-16",
    ]);
  });

  it("recupera più mesi arretrati in un solo avvio", () => {
    expect(
      dueDates(rule({ lastGeneratedMonth: "2026-06" }), "2026-09-16"),
    ).toEqual(["2026-07-05", "2026-08-05", "2026-09-05"]);
  });

  it("è idempotente: dopo aver generato il mese non genera altro", () => {
    expect(
      dueDates(rule({ lastGeneratedMonth: "2026-09" }), "2026-09-30"),
    ).toEqual([]);
  });

  it("usa l'ultimo giorno nei mesi più corti", () => {
    expect(occurrenceDate("2026-09", 31)).toBe("2026-09-30");
    expect(occurrenceDate("2026-02", 31)).toBe("2026-02-28");
    expect(occurrenceDate("2028-02", 30)).toBe("2028-02-29");
    expect(
      dueDates(
        rule({ dayOfMonth: 31, lastGeneratedMonth: "2026-01" }),
        "2026-03-01",
      ),
    ).toEqual(["2026-02-28"]);
  });

  it("una regola sospesa non genera nulla", () => {
    expect(
      dueDates(
        rule({ active: false, lastGeneratedMonth: "2026-01" }),
        "2026-09-16",
      ),
    ).toEqual([]);
  });

  it("modifica importo, nota, giorno e metodo senza toccare i mesi già generati", () => {
    const changed = ruleWithChanges(
      rule(),
      {
        amountCents: 1599,
        note: "  Netflix famiglia  ",
        paymentMethod: "contanti",
        dayOfMonth: 12,
      },
      new Date("2026-09-20T09:00:00.000Z"),
    );
    expect(changed).toMatchObject({
      id: "r1",
      categoryId: "abbonamenti",
      amountCents: 1599,
      note: "Netflix famiglia",
      paymentMethod: "contanti",
      dayOfMonth: 12,
      lastGeneratedMonth: "2026-08",
      updatedAt: "2026-09-20T09:00:00.000Z",
    });
  });

  it("accetta come giorno solo un intero da 1 a 31", () => {
    expect(isValidDayOfMonth(1)).toBe(true);
    expect(isValidDayOfMonth(31)).toBe(true);
    expect(isValidDayOfMonth(0)).toBe(false);
    expect(isValidDayOfMonth(32)).toBe(false);
    expect(isValidDayOfMonth(5.5)).toBe(false);
  });

  it("riattivando non recupera i mesi saltati", () => {
    const resumed = resumedRule(
      rule({ active: false, lastGeneratedMonth: "2026-03" }),
      "2026-09-16",
      NOW,
    );
    expect(resumed).toMatchObject({
      active: true,
      lastGeneratedMonth: "2026-08",
    });
    expect(dueDates(resumed, "2026-09-16")).toEqual(["2026-09-05"]);
  });
});
