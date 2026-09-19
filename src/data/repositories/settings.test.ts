import { beforeEach, describe, expect, it } from "vitest";
import { resetDatabase } from "../testing";
import { getBudgetCents, setBudgetCents } from "./settings";

describe("budget mensile", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("è assente finché non viene impostato", async () => {
    expect(await getBudgetCents()).toBeNull();
  });

  it("si imposta e si toglie con null o 0", async () => {
    await setBudgetCents(150000);
    expect(await getBudgetCents()).toBe(150000);
    await setBudgetCents(0);
    expect(await getBudgetCents()).toBeNull();
  });

  it("rifiuta importi non validi", async () => {
    await expect(setBudgetCents(-1)).rejects.toMatchObject({
      code: "invalidBudget",
    });
  });
});
