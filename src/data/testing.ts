import { db } from "./db";
import { ensureBuiltinCategories } from "./seed";

/** Solo per i test: database vuoto con le categorie predefinite. */
export async function resetDatabase({ seed = true } = {}): Promise<void> {
  await db.delete();
  await db.open();
  if (seed) await ensureBuiltinCategories(new Date("2026-09-01T08:00:00Z"));
}

/** Solo per i test: accesso diretto alle tabelle per preparare i dati. */
export const testDb = db;
