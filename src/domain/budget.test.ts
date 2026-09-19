import { describe, expect, it } from "vitest";
import { budgetStatus, projectMonthEnd } from "./budget";

describe("budget", () => {
  it("calcola quota, residuo e livello", () => {
    expect(budgetStatus(129000, 150000)).toEqual({
      ratio: 0.86,
      remainingCents: 21000,
      level: "warning",
    });
    expect(budgetStatus(30000, 150000).level).toBe("ok");
    expect(budgetStatus(120000, 150000).level).toBe("warning");
    expect(budgetStatus(160000, 150000)).toMatchObject({
      level: "over",
      remainingCents: -10000,
    });
  });

  it("proietta la spesa a fine mese al ritmo attuale", () => {
    expect(projectMonthEnd(128460, 16, 30)).toBe(240863);
    expect(projectMonthEnd(5000, 0, 30)).toBe(0);
  });
});
