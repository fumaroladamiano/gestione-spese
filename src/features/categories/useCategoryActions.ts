import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import {
  archiveCategory,
  createCategory,
  deleteCategory,
  restoreCategory,
  updateCategory,
  type CategoryStyle,
} from "../../data/repositories/categories";
import { countExpensesInCategory } from "../../data/repositories/expenses";
import type { Category } from "../../domain/types";
import { categoryDisplayName } from "../../i18n/categoryNames";
import { errorTextKey } from "../../i18n/errorMessages";
import { useT } from "../../i18n/useT";
import { useUi } from "../../stores/ui";
import { useCategories } from "./useCategories";

/** Numero di spese per categoria (per l'elenco e per decidere se archiviare o eliminare). */
export function useCategoryCounts(): Map<string, number> {
  const categories = useCategories();
  const ids = (categories ?? []).map((category) => category.id).join(",");
  const counts = useLiveQuery(async () => {
    const list = ids === "" ? [] : ids.split(",");
    const values = await Promise.all(
      list.map((id) => countExpensesInCategory(id)),
    );
    return new Map(list.map((id, index) => [id, values[index] ?? 0]));
  }, [ids]);
  return counts ?? new Map<string, number>();
}

/** Azioni sulle categorie con i toast di conferma o di errore. Restituiscono true se riuscite. */
export function useCategoryActions() {
  const t = useT();
  const showToast = useUi((state) => state.showToast);

  return useMemo(() => {
    const run = async (action: () => Promise<string>): Promise<boolean> => {
      try {
        showToast({ message: await action() });
        return true;
      } catch (error) {
        console.error(error);
        showToast({ message: t(errorTextKey(error)) });
        return false;
      }
    };
    return {
      create: (name: string, style: CategoryStyle) =>
        run(async () => {
          const created = await createCategory(name, style);
          return t("categoryCreated", categoryDisplayName(created, t));
        }),
      update: (id: string, name: string, style: CategoryStyle) =>
        run(async () => {
          await updateCategory(id, name, style);
          return t("categoryUpdated");
        }),
      archive: (category: Category) =>
        run(async () => {
          await archiveCategory(category.id);
          return t("categoryArchived", categoryDisplayName(category, t));
        }),
      restore: (category: Category) =>
        run(async () => {
          await restoreCategory(category.id);
          return t("categoryRestored", categoryDisplayName(category, t));
        }),
      remove: (category: Category) =>
        run(async () => {
          await deleteCategory(category.id);
          return t("categoryDeleted");
        }),
    };
  }, [t, showToast]);
}
