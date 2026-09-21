import { Banknote, Calendar, CreditCard, Repeat, Wallet } from "lucide-react";
import { useState } from "react";
import { Chip } from "../../components/Chip";
import { addDays, formatRelativeDay } from "../../domain/dates";
import {
  nextPaymentMethod,
  type ExpenseDraft,
} from "../../domain/expenseDraft";
import { LIMITS, type PaymentMethod } from "../../domain/types";
import { paymentMethodName } from "../../i18n/categoryNames";
import { useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import styles from "./ExpenseDetails.module.css";

const PAYMENT_ICON = { carta: CreditCard, contanti: Banknote, altro: Wallet };

type ExpenseDetailsProps = {
  draft: ExpenseDraft;
  today: string;
  onChange: (changes: Partial<ExpenseDraft>) => void;
  onSubmit: () => void;
  /** Il campo nota prende o perde il focus (e con lui la tastiera di iOS). */
  onNoteFocusChange: (focused: boolean) => void;
};

/** Dettagli opzionali a un tocco: data, metodo di pagamento, nota. */
export function ExpenseDetails({
  draft,
  today,
  onChange,
  onSubmit,
  onNoteFocusChange,
}: ExpenseDetailsProps) {
  const t = useT();
  const language = usePrefs((state) => state.language);
  const [showDates, setShowDates] = useState(false);
  const yesterday = addDays(today, -1);
  const labels = { today: t("today"), yesterday: t("yesterday") };
  const method: PaymentMethod = draft.paymentMethod;

  return (
    <>
      <div className={styles.chips}>
        <Chip
          icon={Calendar}
          label={formatRelativeDay(draft.date, today, language, labels)}
          ariaLabel={t(
            "fieldValue",
            t("date"),
            formatRelativeDay(draft.date, today, language, labels),
          )}
          selected={showDates}
          onClick={() => {
            setShowDates(!showDates);
          }}
        />
        <Chip
          icon={PAYMENT_ICON[method]}
          label={paymentMethodName(method, t)}
          ariaLabel={t(
            "fieldValue",
            t("paymentMethod"),
            paymentMethodName(method, t),
          )}
          onClick={() => {
            onChange({ paymentMethod: nextPaymentMethod(method) });
          }}
        />
        <Chip
          icon={Repeat}
          label={draft.recurring ? t("monthly") : t("oneOff")}
          ariaLabel={t(
            "fieldValue",
            t("recurrence"),
            draft.recurring ? t("monthly") : t("oneOff"),
          )}
          selected={draft.recurring}
          onClick={() => {
            onChange({ recurring: !draft.recurring });
          }}
        />
      </div>

      {showDates ? (
        <div className={styles.dates}>
          <Chip
            variant="soft"
            label={t("today")}
            selected={draft.date === today}
            onClick={() => {
              onChange({ date: today });
            }}
          />
          <Chip
            variant="soft"
            label={t("yesterday")}
            selected={draft.date === yesterday}
            onClick={() => {
              onChange({ date: yesterday });
            }}
          />
          <input
            type="date"
            className={styles.dateInput}
            aria-label={t("pickDate")}
            max={today}
            value={draft.date}
            onChange={(event) => {
              const value = event.target.value;
              // date future non ammesse; un campo svuotato non cambia la data
              if (value) onChange({ date: value > today ? today : value });
            }}
          />
        </div>
      ) : null}

      <input
        className={styles.note}
        aria-label={t("note")}
        placeholder={t("notePlaceholder")}
        maxLength={LIMITS.noteLength}
        autoComplete="off"
        enterKeyHint="done"
        value={draft.note}
        onChange={(event) => {
          onChange({ note: event.target.value });
        }}
        onFocus={() => {
          onNoteFocusChange(true);
        }}
        onBlur={() => {
          onNoteFocusChange(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
            onSubmit();
          }
        }}
      />
    </>
  );
}
