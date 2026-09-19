import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { AmountText } from "../../components/AmountText";
import { DeltaPill } from "../../components/DeltaPill";
import type { MonthComparison } from "../../domain/aggregations";
import { capitalizeFirst, formatMonthName } from "../../domain/dates";
import type { MonthKey } from "../../domain/types";
import { useLocale, useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import styles from "./MonthHeroCard.module.css";

type MonthHeroCardProps = {
  month: MonthKey;
  totalCents: number;
  comparison: MonthComparison;
};

/** Card del mese in gradiente: totale, confronto con il mese precedente, link ai grafici. */
export function MonthHeroCard({
  month,
  totalCents,
  comparison,
}: MonthHeroCardProps) {
  const t = useT();
  const locale = useLocale();
  const language = usePrefs((state) => state.language);
  const previousName = formatMonthName(comparison.previousMonth, language);

  return (
    <Link to="/charts" className={styles.hero} aria-label={t("openCharts")}>
      <div className={styles.top}>
        <span className={styles.eyebrow}>
          {t("spentIn", formatMonthName(month, language))}
        </span>
        <span className={styles.go} aria-hidden>
          <ArrowUpRight size={16} strokeWidth={2.4} />
        </span>
      </div>
      <AmountText cents={totalCents} dimFraction className={styles.amount} />
      <div className={styles.delta}>
        <DeltaPill
          change={comparison.change}
          locale={locale}
          noComparisonLabel={t("noComparison")}
          onHero
        />
        <span>
          {comparison.change === null
            ? t("previousMonthEmpty", capitalizeFirst(previousName))
            : comparison.samePeriod
              ? t("versusSamePeriod", previousName)
              : t("versus", previousName)}
        </span>
      </div>
    </Link>
  );
}
