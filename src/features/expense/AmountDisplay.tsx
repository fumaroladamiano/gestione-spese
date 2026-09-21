import { formatInput } from "../../domain/money";
import { useLocale, useT } from "../../i18n/useT";
import { classNames } from "../../components/classNames";
import styles from "./AmountDisplay.module.css";

// spazio non separabile tra importo e "€", come in Intl.NumberFormat
const NBSP = String.fromCharCode(0xa0);

type AmountDisplayProps = {
  input: string;
  /** Cambia a ogni errore per far ripartire lo "shake". */
  shakeKey: number;
  /** Tocco sull'importo: serve a tornare al tastierino mentre si scrive la nota. */
  onPress?: () => void;
};

/** Importo grande: le cifre non ancora digitate sono "fantasma" in grigio. */
export function AmountDisplay({
  input,
  shakeKey,
  onPress,
}: AmountDisplayProps) {
  const locale = useLocale();
  const t = useT();
  const display = formatInput(input, locale);
  const long = input.replace(/\D/g, "").length > 6;
  const currency = <span className={styles.currency}>€</span>;

  return (
    <div
      key={shakeKey}
      className={classNames(
        styles.amount,
        long && styles.long,
        shakeKey > 0 && styles.shake,
      )}
      role="status"
      aria-label={t("amount")}
      data-testid="amount-display"
      onClick={onPress}
    >
      {display.currencyBefore ? currency : null}
      {display.integer}
      {display.separator}
      {display.decimals}
      <span className={styles.ghost}>{display.ghost}</span>
      {display.currencyBefore ? null : (
        <>
          {NBSP}
          {currency}
        </>
      )}
    </div>
  );
}
