import { generateDueExpenses } from "../data/repositories/recurringRules";
import { ensureBuiltinCategories } from "../data/seed";
import { isStandalone } from "../features/install/useStandalone";

/** Crea le spese ricorrenti dovute; gli errori si registrano senza bloccare l'app. */
async function generateRecurring(): Promise<void> {
  try {
    await generateDueExpenses();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Operazioni all'avvio dell'app: categorie predefinite mancanti (idempotente), spese
 * ricorrenti dovute e, nell'app installata, richiesta di archiviazione persistente.
 * Le schermate si aggiornano da sole quando i dati arrivano (useLiveQuery).
 */
export async function startApp(): Promise<void> {
  try {
    await ensureBuiltinCategories();
  } catch (error) {
    console.error(error);
  }
  await generateRecurring();
  // iOS tiene l'app sospesa anche per giorni: al ritorno in primo piano si ricontrolla
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void generateRecurring();
  });
  // chiede a Safari di non cancellare i dati in caso di poco spazio (R3)
  if (isStandalone() && typeof navigator.storage.persist === "function") {
    try {
      await navigator.storage.persist();
    } catch (error) {
      console.error(error);
    }
  }
}
