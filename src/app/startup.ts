import { ensureBuiltinCategories } from "../data/seed";
import { isStandalone } from "../features/install/useStandalone";

/**
 * Operazioni all'avvio dell'app: categorie predefinite mancanti (idempotente) e,
 * nell'app installata, richiesta di archiviazione persistente al browser.
 * Le schermate si aggiornano da sole quando i dati arrivano (useLiveQuery).
 */
export async function startApp(): Promise<void> {
  try {
    await ensureBuiltinCategories();
  } catch (error) {
    console.error(error);
  }
  // chiede a Safari di non cancellare i dati in caso di poco spazio (R3)
  if (isStandalone() && typeof navigator.storage.persist === "function") {
    try {
      await navigator.storage.persist();
    } catch (error) {
      console.error(error);
    }
  }
}
