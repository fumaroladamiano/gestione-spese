import { useLiveQuery } from "dexie-react-hooks";
import { findCategoryForNote } from "../../data/repositories/expenses";

/** Id della categoria usata l'ultima volta con questa nota, oppure null. */
export function useCategorySuggestion(note: string): string | null {
  return useLiveQuery(() => findCategoryForNote(note), [note]) ?? null;
}
