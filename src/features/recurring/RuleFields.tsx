import {
  Banknote,
  CalendarClock,
  ChevronDown,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Chip } from "../../components/Chip";
import { nextPaymentMethod } from "../../domain/expenseDraft";
import { LIMITS, type PaymentMethod } from "../../domain/types";
import { paymentMethodName } from "../../i18n/categoryNames";
import { useT } from "../../i18n/useT";
import styles from "./RuleSheet.module.css";

const PAYMENT_ICON = { carta: CreditCard, contanti: Banknote, altro: Wallet };
const DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

type RuleFieldsProps = {
  categoryName: string;
  note: string;
  dayOfMonth: number;
  paymentMethod: PaymentMethod;
  onChange: (changes: {
    note?: string;
    dayOfMonth?: number;
    paymentMethod?: PaymentMethod;
  }) => void;
  /** Il campo nota prende o perde il focus (e con lui la tastiera di iOS). */
  onNoteFocusChange: (focused: boolean) => void;
};

/** Campi della regola sotto l'importo: nota, giorno del mese e metodo di pagamento. */
export function RuleFields({
  categoryName,
  note,
  dayOfMonth,
  paymentMethod,
  onChange,
  onNoteFocusChange,
}: RuleFieldsProps) {
  const t = useT();

  return (
    <>
      <p className={styles.category}>{t("ruleCategoryFixed", categoryName)}</p>
      <input
        className={styles.note}
        aria-label={t("note")}
        placeholder={t("notePlaceholder")}
        maxLength={LIMITS.noteLength}
        autoComplete="off"
        enterKeyHint="done"
        value={note}
        onChange={(event) => {
          onChange({ note: event.target.value });
        }}
        onFocus={() => {
          onNoteFocusChange(true);
        }}
        onBlur={() => {
          onNoteFocusChange(false);
        }}
      />
      <div className={styles.chips}>
        <label className={styles.day}>
          <CalendarClock size={16} strokeWidth={2} aria-hidden />
          <select
            className={styles.select}
            aria-label={t("dayOfMonth")}
            value={dayOfMonth}
            onChange={(event) => {
              onChange({ dayOfMonth: Number(event.target.value) });
            }}
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {t("dayOfMonthValue", day)}
              </option>
            ))}
          </select>
          <ChevronDown
            className={styles.caret}
            size={14}
            strokeWidth={2.6}
            aria-hidden
          />
        </label>
        <Chip
          icon={PAYMENT_ICON[paymentMethod]}
          label={paymentMethodName(paymentMethod, t)}
          ariaLabel={t(
            "fieldValue",
            t("paymentMethod"),
            paymentMethodName(paymentMethod, t),
          )}
          onClick={() => {
            onChange({ paymentMethod: nextPaymentMethod(paymentMethod) });
          }}
        />
      </div>
    </>
  );
}
