import { AmountText } from "../../components/AmountText";
import { useT } from "../../i18n/useT";
import styles from "./TotalBanner.module.css";

type TotalBannerProps = {
  totalCents: number;
  count: number;
};

/** Totale dei risultati filtrati, sempre visibile in alto durante lo scorrimento. */
export function TotalBanner({ totalCents, count }: TotalBannerProps) {
  const t = useT();
  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <div>
        <div className={styles.label}>{t("filteredTotal")}</div>
        <div className={styles.count}>{t("nExpenses", count)}</div>
      </div>
      <AmountText cents={totalCents} className={styles.amount} />
    </div>
  );
}
