import { AmountText } from "../../components/AmountText";
import { BudgetProgress } from "../../components/BudgetProgress";
import { classNames } from "../../components/classNames";
import { projectMonthEnd } from "../../domain/budget";
import { formatAmount } from "../../domain/money";
import { useLocale, useT } from "../../i18n/useT";
import styles from "./BudgetCard.module.css";

type BudgetCardProps = {
  spentCents: number;
  budgetCents: number;
  /** Solo per il mese in corso: giorni trascorsi e totali, per la proiezione. */
  projection: { elapsedDays: number; daysInMonth: number } | null;
};

/** Budget del mese nei Grafici, con la proiezione a fine mese per il mese in corso. */
export function BudgetCard({
  spentCents,
  budgetCents,
  projection,
}: BudgetCardProps) {
  const t = useT();
  const locale = useLocale();
  const projected = projection
    ? projectMonthEnd(
        spentCents,
        projection.elapsedDays,
        projection.daysInMonth,
      )
    : null;
  const projectedText =
    projected === null
      ? null
      : formatAmount(projected, locale, { wholeEuros: true });

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <AmountText cents={spentCents} className={styles.spent} />
        <span className={styles.of}>
          / <AmountText cents={budgetCents} wholeEuros />
        </span>
      </div>
      <BudgetProgress spentCents={spentCents} budgetCents={budgetCents} />
      {projectedText !== null && projected !== null ? (
        <p
          className={classNames(
            styles.projection,
            projected > budgetCents && styles.over,
          )}
        >
          {projected > budgetCents
            ? t("projectionOver", projectedText)
            : t("projection", projectedText)}
        </p>
      ) : null}
    </section>
  );
}
