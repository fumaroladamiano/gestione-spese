import { formatAmount, formatAmountParts } from "../domain/money";
import { useLocale } from "../i18n/useT";
import { classNames } from "./classNames";
import styles from "./AmountText.module.css";

type AmountTextProps = {
  cents: number;
  className?: string;
  /** Decimali e simbolo più piccoli e attenuati (card del mese). */
  dimFraction?: boolean;
  /** Senza decimali (es. budget). */
  wholeEuros?: boolean;
};

/** Importo nella lingua attiva, font arrotondato e cifre tabellari. */
export function AmountText({
  cents,
  className,
  dimFraction = false,
  wholeEuros = false,
}: AmountTextProps) {
  const locale = useLocale();
  if (!dimFraction) {
    return (
      <span className={classNames(styles.amount, className)}>
        {formatAmount(cents, locale, { wholeEuros })}
      </span>
    );
  }
  return (
    <span className={classNames(styles.amount, className)}>
      {formatAmountParts(cents, locale).map((part, index) => (
        <span
          // le parti di un importo formattato non cambiano ordine
          key={index}
          className={
            part.kind === "fraction"
              ? styles.fraction
              : part.kind === "currency"
                ? styles.currency
                : undefined
          }
        >
          {part.value}
        </span>
      ))}
    </span>
  );
}
