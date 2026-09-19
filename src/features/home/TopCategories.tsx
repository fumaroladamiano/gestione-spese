import type { CSSProperties } from "react";
import { AmountText } from "../../components/AmountText";
import { CategoryIcon } from "../../components/CategoryIcon";
import type { CategoryTotal } from "../../domain/aggregations";
import { formatPercent } from "../../domain/money";
import { useLocale } from "../../i18n/useT";
import { useCategoryMap, useCategoryName } from "../categories/useCategories";
import styles from "./TopCategories.module.css";

type TopCategoriesProps = {
  totals: CategoryTotal[];
};

/** Categorie con più spesa nel mese, con barra proporzionale alla prima. */
export function TopCategories({ totals }: TopCategoriesProps) {
  const locale = useLocale();
  const categories = useCategoryMap();
  const nameOf = useCategoryName();
  const max = totals[0]?.totalCents ?? 1;

  return (
    <section className={styles.card}>
      {totals.map((total) => {
        const category = categories.get(total.categoryId);
        if (!category) return null;
        const bar: CSSProperties = {
          width: `${String((total.totalCents / max) * 100)}%`,
          "--c-light": category.colorLight,
          "--c-dark": category.colorDark,
        };
        return (
          <div key={total.categoryId} className={styles.row}>
            <CategoryIcon category={category} size={32} />
            <div className={styles.main}>
              <div className={styles.line}>
                <span className={styles.name}>
                  {nameOf(category)}
                  <span className={styles.percent}>
                    {formatPercent(total.share, locale)}
                  </span>
                </span>
                <AmountText
                  cents={total.totalCents}
                  className={styles.amount}
                />
              </div>
              <div className={styles.track}>
                <i className={styles.bar} style={bar} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
