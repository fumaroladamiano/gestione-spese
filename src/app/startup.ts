import { ensureBuiltinCategories } from "../data/seed";

/**
 * Operazioni all'avvio dell'app: categorie predefinite mancanti (idempotente).
 * Le schermate si aggiornano da sole quando i dati arrivano (useLiveQuery).
 */
export async function startApp(): Promise<void> {
  try {
    await ensureBuiltinCategories();
  } catch (error) {
    console.error(error);
  }
}
