import { Delete } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
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
  /** Falso mentre si scrive la nota: la tastiera di iOS prende il suo posto. */
  visible: boolean;
};

const SPRING = { type: "spring", damping: 34, stiffness: 380 } as const;
// con "riduci movimento" il tastierino compare e scompare solo in dissolvenza
const REDUCED = { height: { duration: 0 }, opacity: { duration: 0.2 } };

/** Tastierino integrato 3×4: niente tastiera di iOS, niente zoom, separatore della lingua. */
export function AmountKeypad({ onKey, visible }: AmountKeypadProps) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <m.div
          key="keypad"
          className={styles.collapse}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={reducedMotion ? REDUCED : SPRING}
        >
          <KeypadKeys onKey={onKey} />
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

function KeypadKeys({ onKey }: Pick<AmountKeypadProps, "onKey">) {
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
