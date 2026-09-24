import { useState } from "react";
import { ActionSheet } from "../../components/ActionSheet";
import { Sheet } from "../../components/Sheet";
import { SheetHeader } from "../../components/SheetHeader";
import {
  centsToInput,
  formatAmount,
  inputToCents,
  isValidAmount,
  pressKey,
  type KeypadKey,
} from "../../domain/money";
import type { RuleChanges } from "../../domain/recurring";
import type { PaymentMethod, RecurringRule } from "../../domain/types";
import { useLocale, useT } from "../../i18n/useT";
import { AmountDisplay } from "../expense/AmountDisplay";
import { AmountKeypad } from "../expense/AmountKeypad";
import { RuleFields } from "./RuleFields";
import styles from "./RuleSheet.module.css";
import { useRuleActions } from "./useRecurringRules";

type RuleSheetProps = {
  open: boolean;
  /** Regola da modificare, letta solo all'apertura. */
  rule: RecurringRule;
  categoryName: string;
  onClose: () => void;
};

type RuleDraft = {
  note: string;
  dayOfMonth: number;
  paymentMethod: PaymentMethod;
};

/** Foglio "Modifica regola": importo, nota, giorno del mese e metodo (la categoria non cambia). */
export function RuleSheet({
  open,
  rule,
  categoryName,
  onClose,
}: RuleSheetProps) {
  const t = useT();
  const locale = useLocale();
  const actions = useRuleActions();
  const [amountInput, setAmountInput] = useState(() =>
    centsToInput(rule.amountCents),
  );
  const [draft, setDraft] = useState<RuleDraft>(() => ({
    note: rule.note,
    dayOfMonth: rule.dayOfMonth,
    paymentMethod: rule.paymentMethod,
  }));
  const [shake, setShake] = useState(0);
  const [noteFocused, setNoteFocused] = useState(false);
  const [askApply, setAskApply] = useState(false);

  const amountCents = inputToCents(amountInput);
  const valid = isValidAmount(amountCents);

  const pressAmountKey = (key: KeypadKey) => {
    const next = pressKey(amountInput, key);
    if (next === null) setShake((n) => n + 1);
    else setAmountInput(next);
  };

  const save = (applyToExisting: boolean) => {
    const changes: RuleChanges = { ...draft, amountCents };
    void actions.save(rule, changes, applyToExisting).then((ok) => {
      if (ok) onClose();
    });
  };

  const submit = () => {
    if (!valid) {
      setShake((n) => n + 1);
      return;
    }
    // importo cambiato: le spese già create si aggiornano solo se l'utente lo chiede
    if (amountCents === rule.amountCents) save(false);
    else setAskApply(true);
  };

  const closeAnd = (action: () => Promise<void>) => {
    onClose();
    void action();
  };

  return (
    <>
      <Sheet
        open={open}
        onRequestClose={onClose}
        label={t("editRule")}
        header={
          <SheetHeader
            title={t("editRule")}
            cancelLabel={t("cancel")}
            onCancel={onClose}
            actionLabel={t("save")}
            actionEnabled={valid}
            onAction={submit}
          />
        }
        footer={<AmountKeypad onKey={pressAmountKey} visible={!noteFocused} />}
      >
        <AmountDisplay input={amountInput} shakeKey={shake} />
        <RuleFields
          categoryName={categoryName}
          note={draft.note}
          dayOfMonth={draft.dayOfMonth}
          paymentMethod={draft.paymentMethod}
          onChange={(changes) => {
            setDraft((current) => ({ ...current, ...changes }));
          }}
          onNoteFocusChange={setNoteFocused}
        />
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.action}
            onClick={() => {
              closeAnd(() => actions.toggle(rule));
            }}
          >
            {rule.active ? t("suspendRule") : t("resumeRule")}
          </button>
          <button
            type="button"
            className={styles.danger}
            onClick={() => {
              closeAnd(() => actions.remove(rule));
            }}
          >
            {t("deleteRule")}
          </button>
        </div>
      </Sheet>

      <ActionSheet
        open={askApply}
        title={t("applyAmountTitle")}
        message={t(
          "applyAmountMessage",
          formatAmount(rule.amountCents, locale),
          formatAmount(amountCents, locale),
        )}
        actions={[
          {
            label: t("applyAmountFuture"),
            onSelect: () => {
              setAskApply(false);
              save(false);
            },
          },
          {
            label: t("applyAmountAll"),
            onSelect: () => {
              setAskApply(false);
              save(true);
            },
          },
        ]}
        cancelLabel={t("cancel")}
        onCancel={() => {
          setAskApply(false);
        }}
      />
    </>
  );
}
