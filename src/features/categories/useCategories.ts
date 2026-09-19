import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useMemo } from "react";
import { getCategories } from "../../data/repositories/categories";
import type { Category } from "../../domain/types";
import { categoryDisplayName } from "../../i18n/categoryNames";
import { useT } from "../../i18n/useT";

/** Tutte le categorie in ordine, aggiornate in tempo reale (undefined durante il caricamento). */
export function useCategories(): Category[] | undefined {
  return useLiveQuery(getCategories, []);
}

/** Categorie per id, per trovare in fretta quella di ogni spesa. */
export function useCategoryMap(): Map<string, Category> {
  const categories = useCategories();
  return useMemo(
    () =>
      new Map((categories ?? []).map((category) => [category.id, category])),
    [categories],
  );
}

/** Nome mostrato di una categoria nella lingua attiva. */
export function useCategoryName(): (category: Category) => string {
  const t = useT();
  return useCallback(
    (category: Category) => categoryDisplayName(category, t),
    [t],
  );
}
