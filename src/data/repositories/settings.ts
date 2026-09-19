import { isValidAmount } from "../../domain/money";
import { db } from "../db";
import { DataError } from "../errors";

/** Budget mensile globale in centesimi; null = nessun budget. */
export async function getBudgetCents(): Promise<number | null> {
  const row = await db.settings.get("budgetCents");
  return row && row.value > 0 ? row.value : null;
}

/** Imposta il budget; null o 0 lo tolgono. */
export async function setBudgetCents(cents: number | null): Promise<void> {
  if (cents === null || cents === 0) {
    await db.settings.delete("budgetCents");
    return;
  }
  if (!isValidAmount(cents)) throw new DataError("invalidBudget");
  await db.settings.put({ key: "budgetCents", value: cents });
}
