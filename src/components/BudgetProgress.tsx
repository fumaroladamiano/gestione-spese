import type { CSSProperties } from "react";
import { budgetStatus } from "../domain/budget";
import { formatAmount, formatPercent } from "../domain/money";
import { useLocale, useT } from "../i18n/useT";
import { classNames } from "./classNames";
import styles from "./BudgetProgress.module.css";

type BudgetProgressProps = {
  spentCents: number;
  budgetCents: number;
  /** Giorni rimanenti nel mese (solo per il mese in corso). */
  daysLeft?: number | null;
  /** Versione per la card in gradiente (barra bianca, gialla o rosa). */
  onHero?: boolean;
};

/**
 * Barra del budget con soglie 80% / 100%: il colore è sempre accompagnato
 * dal testo "Restano" o "Sforato di" (il colore non è l'unico indicatore).
 */
export function BudgetProgress({
  spentCents,
  budgetCents,
  daysLeft = null,
  onHero = false,
}: BudgetProgressProps) {
  const t = useT();
  const locale = useLocale();
  const status = budgetStatus(spentCents, budgetCents);
  const fill: CSSProperties = {
    width: `${String(Math.min(100, status.ratio * 100))}%`,
  };

  return (
    <div className={classNames(styles.budget, onHero && styles.hero)}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.min(100, status.ratio * 100))}
        aria-label={t("budget")}
      >
        <i
          className={classNames(styles.fill, styles[status.level])}
          style={fill}
        />
      </div>
      <div className={styles.meta}>
        <span>
          {t(
            "budgetOf",
            formatPercent(status.ratio, locale),
            formatAmount(budgetCents, locale, { wholeEuros: true }),
          )}
        </span>
        <span>
          {status.remainingCents >= 0
            ? t("budgetRemaining", formatAmount(status.remainingCents, locale))
            : t("budgetOver", formatAmount(-status.remainingCents, locale))}
          {daysLeft !== null ? ` · ${t("daysLeft", daysLeft)}` : null}
        </span>
      </div>
    </div>
  );
}
