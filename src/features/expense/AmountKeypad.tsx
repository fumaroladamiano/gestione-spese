import { Delete } from "lucide-react";
import { decimalSeparator, type KeypadKey } from "../../domain/money";
import { useLocale, useT } from "../../i18n/useT";
import { classNames } from "../../components/classNames";
import styles from "./AmountKeypad.module.css";

const LAYOUT: KeypadKey[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "decimal",
  "0",
  "backspace",
];

type AmountKeypadProps = {
  onKey: (key: KeypadKey) => void;
};

/** Tastierino integrato 3×4: niente tastiera di iOS, niente zoom, separatore della lingua. */
export function AmountKeypad({ onKey }: AmountKeypadProps) {
  const locale = useLocale();
  const t = useT();
  const separator = decimalSeparator(locale);

  return (
    <div className={styles.keypad}>
      {LAYOUT.map((key) => {
        const secondary = key === "decimal" || key === "backspace";
        return (
          <button
            key={key}
            type="button"
            className={classNames(styles.key, secondary && styles.secondary)}
            aria-label={key === "backspace" ? t("deleteKey") : undefined}
            onClick={() => {
              onKey(key);
            }}
          >
            {key === "backspace" ? (
              <Delete size={26} strokeWidth={1.8} aria-hidden />
            ) : key === "decimal" ? (
              separator
            ) : (
              key
            )}
          </button>
        );
      })}
    </div>
  );
}
