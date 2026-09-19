import { useEffect, useEffectEvent, useState } from "react";
import { ActionSheet } from "../../components/ActionSheet";
import { Sheet } from "../../components/Sheet";
import { SheetHeader } from "../../components/SheetHeader";
import { todayISO } from "../../domain/dates";
import {
  checkDraft,
  draftFromExpense,
  isDraftDirty,
  newDraft,
  type ExpenseDraft,
} from "../../domain/expenseDraft";
import { pressKey, type KeypadKey } from "../../domain/money";
import type { Expense, RecurringRule } from "../../domain/types";
import { useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import { useCategories } from "../categories/useCategories";
import { AmountDisplay } from "./AmountDisplay";
import { AmountKeypad } from "./AmountKeypad";
import { CategoryPicker } from "./CategoryPicker";
import { ExpenseDetails } from "./ExpenseDetails";
import styles from "./ExpenseForm.module.css";
import { useSaveExpense } from "./useSaveExpense";

type ExpenseFormProps = {
  open: boolean;
  /** Spesa da modificare, oppure null per una nuova spesa. Letta solo all'apertura. */
  expense: Expense | null;
  /** Regola ricorrente collegata alla spesa in modifica, se esiste. */
  rule: RecurringRule | null;
  onClose: () => void;
  onDelete: (id: string) => void;
};

/** Contenuto del foglio spesa: importo, categoria, dettagli e tastierino. */
export function ExpenseForm({
  open,
  expense,
  rule,
  onClose,
  onDelete,
}: ExpenseFormProps) {
  const t = useT();
  const defaultMethod = usePrefs((state) => state.defaultPaymentMethod);
  const [today] = useState(() => todayISO());
  const [initial] = useState<ExpenseDraft>(() =>
    expense
      ? draftFromExpense(expense, rule?.active ?? false)
      : newDraft(today, defaultMethod),
  );
  const [expenseId] = useState(() => expense?.id ?? null);
  const [ruleId] = useState(() => rule?.id ?? null);
  const [draft, setDraft] = useState(initial);
  const [amountShake, setAmountShake] = useState(0);
  const [categoryShake, setCategoryShake] = useState(0);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const categories = useCategories() ?? [];
  const save = useSaveExpense();

  // nella griglia solo le categorie attive, più quella (archiviata) della spesa in modifica
  const selectable = categories.filter(
    (category) => !category.archived || category.id === initial.categoryId,
  );

  const change = (changes: Partial<ExpenseDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
  };

  const pressAmountKey = (key: KeypadKey) => {
    const next = pressKey(draft.amountInput, key);
    if (next === null) setAmountShake((n) => n + 1);
    else change({ amountInput: next });
  };

  const submit = async () => {
    const check = checkDraft(draft);
    if (!check.ok) {
      if (check.missing === "amount") setAmountShake((n) => n + 1);
      else setCategoryShake((n) => n + 1);
      return;
    }
    const category = categories.find(
      (item) => item.id === check.input.categoryId,
    );
    if (!category) return;
    const recurring = {
      enabled: draft.recurring,
      ruleId,
      wasActive: initial.recurring,
    };
    if (await save(check.input, category, expenseId, recurring)) onClose();
  };

  const requestClose = () => {
    if (isDraftDirty(draft, initial)) setConfirmDiscard(true);
    else onClose();
  };

  // tastiera fisica (PC, iPad): cifre, virgola o punto, cancella, Invio
  const onPhysicalKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || confirmDiscard) return;
    if (/^[0-9]$/.test(event.key)) pressAmountKey(event.key as KeypadKey);
    else if (event.key === "," || event.key === ".") pressAmountKey("decimal");
    else if (event.key === "Backspace") pressAmountKey("backspace");
    else if (event.key === "Enter") void submit();
    else return;
    event.preventDefault();
  });

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onPhysicalKey);
    return () => {
      document.removeEventListener("keydown", onPhysicalKey);
    };
  }, [open]);

  const valid = checkDraft(draft).ok;
  const title = expenseId === null ? t("newExpense") : t("editExpense");

  return (
    <>
      <Sheet
        open={open}
        onRequestClose={requestClose}
        label={title}
        header={
          <SheetHeader
            title={title}
            cancelLabel={t("cancel")}
            onCancel={requestClose}
            actionLabel={t("save")}
            actionEnabled={valid}
            onAction={() => void submit()}
          />
        }
        footer={<AmountKeypad onKey={pressAmountKey} />}
      >
        <AmountDisplay input={draft.amountInput} shakeKey={amountShake} />
        <CategoryPicker
          categories={selectable}
          value={draft.categoryId}
          onSelect={(categoryId) => {
            change({ categoryId });
          }}
          shakeKey={categoryShake}
        />
        <ExpenseDetails
          draft={draft}
          today={today}
          onChange={change}
          onSubmit={() => void submit()}
        />
        {expenseId !== null ? (
          <button
            type="button"
            className={styles.delete}
            onClick={() => {
              onDelete(expenseId);
            }}
          >
            {t("deleteExpense")}
          </button>
        ) : null}
      </Sheet>
      <ActionSheet
        open={confirmDiscard}
        title={
          expenseId === null ? t("discardNewTitle") : t("discardChangesTitle")
        }
        message={t("discardMessage")}
        actions={[
          {
            label: t("discard"),
            destructive: true,
            onSelect: () => {
              setConfirmDiscard(false);
              onClose();
            },
          },
        ]}
        cancelLabel={t("cancel")}
        onCancel={() => {
          setConfirmDiscard(false);
        }}
      />
    </>
  );
}
