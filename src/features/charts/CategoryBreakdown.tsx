import { ChevronRight } from "lucide-react";
import { AmountText } from "../../components/AmountText";
import { CategoryIcon } from "../../components/CategoryIcon";
import { classNames } from "../../components/classNames";
import type { CategoryTotal } from "../../domain/aggregations";
import { formatAmount, formatPercent } from "../../domain/money";
import { useLocale, useT } from "../../i18n/useT";
import { useCategoryMap, useCategoryName } from "../categories/useCategories";
import styles from "./CategoryBreakdown.module.css";
import { DonutChart } from "./DonutChart";

type CategoryBreakdownProps = {
  totals: CategoryTotal[];
  totalCents: number;
  selected: string | null;
  onSelect: (categoryId: string) => void;
  onOpenHistory: (categoryId: string) => void;
};

/** Ciambella con legenda: toccare una categoria la evidenzia e offre lo storico filtrato. */
export function CategoryBreakdown({
  totals,
  totalCents,
  selected,
  onSelect,
  onOpenHistory,
}: CategoryBreakdownProps) {
  const t = useT();
  const locale = useLocale();
  const categories = useCategoryMap();
  const nameOf = useCategoryName();
  const rows = totals.flatMap((total) => {
    const category = categories.get(total.categoryId);
    return category ? [{ total, category }] : [];
  });
  const selectedRow = rows.find((row) => row.category.id === selected);

  return (
    <section className={styles.card}>
      <DonutChart
        slices={rows.map(({ total, category }) => ({
          id: category.id,
          totalCents: total.totalCents,
          colorLight: category.colorLight,
          colorDark: category.colorDark,
        }))}
        selected={selected}
        onSelect={onSelect}
      >
        {selectedRow ? (
          <>
            <AmountText
              cents={selectedRow.total.totalCents}
              className={styles.centerAmount}
            />
            <span className={styles.centerLabel}>
              {nameOf(selectedRow.category)} ·{" "}
              {formatPercent(selectedRow.total.share, locale)}
            </span>
          </>
        ) : (
          <>
            <AmountText
              cents={totalCents}
              wholeEuros
              className={styles.centerAmount}
            />
            <span className={styles.centerLabel}>
              {totalCents > 0 ? t("total") : t("noExpensesTitle")}
            </span>
          </>
        )}
      </DonutChart>

      <div className={styles.legend}>
        {rows.map(({ total, category }) => (
          <button
            key={category.id}
            type="button"
            className={classNames(
              styles.row,
              selected !== null && selected !== category.id && styles.faded,
            )}
            aria-pressed={selected === category.id}
            aria-label={t(
              "categoryShare",
              nameOf(category),
              formatPercent(total.share, locale),
              formatAmount(total.totalCents, locale),
            )}
            onClick={() => {
              onSelect(category.id);
            }}
          >
            <CategoryIcon category={category} size={32} />
            <span className={styles.name}>{nameOf(category)}</span>
            <span className={styles.percent}>
              {formatPercent(total.share, locale)}
            </span>
            <AmountText cents={total.totalCents} className={styles.amount} />
          </button>
        ))}
      </div>

      {selectedRow ? (
        <button
          type="button"
          className={styles.link}
          onClick={() => {
            onOpenHistory(selectedRow.category.id);
          }}
        >
          {t("seeInHistory", nameOf(selectedRow.category))}
          <ChevronRight size={16} strokeWidth={2.4} aria-hidden />
        </button>
      ) : null}
    </section>
  );
}
