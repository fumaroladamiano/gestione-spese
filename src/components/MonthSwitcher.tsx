import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, formatMonthYear, type DateLanguage } from "../domain/dates";
import type { MonthKey } from "../domain/types";
import { classNames } from "./classNames";
import styles from "./MonthSwitcher.module.css";

type MonthSwitcherProps = {
  month: MonthKey;
  onChange: (month: MonthKey) => void;
  /** Primo mese raggiungibile (es. quello della prima spesa). */
  min: MonthKey;
  /** Ultimo mese raggiungibile: non si va oltre il mese corrente. */
  max: MonthKey;
  language: DateLanguage;
  labels: { previous: string; next: string };
  /** Testo attenuato (es. "Tutti i mesi" attivo nei filtri). */
  muted?: boolean;
  /** Senza card: dentro un'altra card (foglio filtri). */
  inline?: boolean;
};

/** Selettore "‹ Settembre 2026 ›" con frecce su fondo tenue. */
export function MonthSwitcher({
  month,
  onChange,
  min,
  max,
  language,
  labels,
  muted = false,
  inline = false,
}: MonthSwitcherProps) {
  return (
    <div className={classNames(styles.switcher, !inline && styles.card)}>
      <button
        type="button"
        className={styles.arrow}
        aria-label={labels.previous}
        disabled={month <= min}
        onClick={() => {
          onChange(addMonths(month, -1));
        }}
      >
        <ChevronLeft size={20} strokeWidth={2.6} aria-hidden />
      </button>
      <span
        className={classNames(styles.label, muted && styles.muted)}
        aria-live="polite"
      >
        {formatMonthYear(month, language)}
      </span>
      <button
        type="button"
        className={styles.arrow}
        aria-label={labels.next}
        disabled={month >= max}
        onClick={() => {
          onChange(addMonths(month, 1));
        }}
      >
        <ChevronRight size={20} strokeWidth={2.6} aria-hidden />
      </button>
    </div>
  );
}
