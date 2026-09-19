import { useCallback, useMemo } from "react";
import { FALLBACK_CATEGORY_ID } from "../../domain/categories";
import { formatRelativeDay, todayISO } from "../../domain/dates";
import { formatAmount } from "../../domain/money";
import type { Category, Expense } from "../../domain/types";
import {
  categoryDisplayName,
  paymentMethodName,
} from "../../i18n/categoryNames";
import { useLocale, useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import { useUi } from "../../stores/ui";
import { useCategoryMap } from "../categories/useCategories";
import { useDeleteExpense } from "./useDeleteExpense";

// icona neutra se la categoria non si trova (es. subito dopo un'importazione)
const UNKNOWN_CATEGORY: Pick<Category, "icon" | "colorLight" | "colorDark"> = {
  icon: "dots",
  colorLight: "#8E8E93",
  colorDark: "#98989D",
};

/**
 * Prepara i dati di una riga spesa nella lingua attiva:
 * titolo (nota o categoria), sottotitolo "categoria · metodo · giorno", aria-label, azioni.
 */
export function useExpenseRow() {
  const t = useT();
  const locale = useLocale();
  const language = usePrefs((state) => state.language);
  const categories = useCategoryMap();
  const openEditExpense = useUi((state) => state.openEditExpense);
  const deleteWithUndo = useDeleteExpense();

  const labels = useMemo(
    () => ({ edit: t("edit"), delete: t("delete"), recurring: t("recurring") }),
    [t],
  );

  return useCallback(
    (expense: Expense, { showDate = false }: { showDate?: boolean } = {}) => {
      const category =
        categories.get(expense.categoryId) ??
        categories.get(FALLBACK_CATEGORY_ID);
      const categoryName = category ? categoryDisplayName(category, t) : "";
      const method = paymentMethodName(expense.paymentMethod, t);
      const day = formatRelativeDay(expense.date, todayISO(), language, {
        today: t("today"),
        yesterday: t("yesterday"),
      });
      const subtitle = [
        expense.note ? categoryName : null,
        method,
        showDate ? day : null,
      ]
        .filter((part) => part !== null)
        .join(" · ");
      return {
        category: category ?? UNKNOWN_CATEGORY,
        title: expense.note || categoryName,
        subtitle,
        amountCents: expense.amountCents,
        recurring: expense.recurringRuleId !== undefined,
        ariaLabel: t(
          "expenseRowLabel",
          formatAmount(expense.amountCents, locale),
          categoryName,
          expense.note,
          day,
          method,
        ),
        labels,
        onEdit: () => {
          openEditExpense(expense.id);
        },
        onDelete: () => {
          void deleteWithUndo(expense.id);
        },
      };
    },
    [categories, t, locale, language, labels, openEditExpense, deleteWithUndo],
  );
}
