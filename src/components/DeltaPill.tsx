import { formatPercent, type NumberLocale } from "../domain/money";
import { classNames } from "./classNames";
import styles from "./DeltaPill.module.css";

type DeltaPillProps = {
  /** Variazione (0.12 = +12%); null = nessun confronto possibile. */
  change: number | null;
  locale: NumberLocale;
  noComparisonLabel: string;
  /** Versione bianca per la card in gradiente. */
  onHero?: boolean;
};

/** Variazione %: ▲ rosso = spendo di più, ▼ verde = spendo di meno (il colore non è l'unico segnale). */
export function DeltaPill({
  change,
  locale,
  noComparisonLabel,
  onHero = false,
}: DeltaPillProps) {
  if (change === null) {
    return (
      <span
        className={classNames(
          styles.pill,
          styles.neutral,
          onHero && styles.hero,
        )}
      >
        {noComparisonLabel}
      </span>
    );
  }
  const up = change > 0;
  return (
    <span
      className={classNames(
        styles.pill,
        up ? styles.up : styles.down,
        onHero && styles.hero,
      )}
    >
      {up ? "▲" : "▼"} {formatPercent(change, locale, { signed: true })}
    </span>
  );
}
