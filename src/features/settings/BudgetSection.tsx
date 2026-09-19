import { Target } from "lucide-react";
import { useState } from "react";
import { ListGroup } from "../../components/ListGroup";
import { formatAmountField, parseLocaleAmount } from "../../domain/money";
import { useLocale, useT } from "../../i18n/useT";
import { useUi } from "../../stores/ui";
import styles from "./BudgetSection.module.css";
import { useBudget, useSaveBudget } from "./useBudget";

/** Budget mensile: si digita nel formato della lingua; vuoto = nessun budget. */
export function BudgetSection() {
  const t = useT();
  const locale = useLocale();
  const budget = useBudget();
  const saveBudget = useSaveBudget();
  const showToast = useUi((state) => state.showToast);
  // testo in modifica; null = si mostra il valore salvato
  const [editing, setEditing] = useState<string | null>(null);

  const commit = () => {
    if (editing === null) return;
    const text = editing.trim();
    setEditing(null);
    if (text === "") {
      if (budget !== null) void saveBudget(null);
      return;
    }
    const cents = parseLocaleAmount(text, locale);
    if (cents === null || cents === 0) {
      showToast({ message: t("errorInvalidAmount") });
      return;
    }
    if (cents !== budget) void saveBudget(cents);
  };

  return (
    <ListGroup title={t("budget")} footer={t("budgetFooter")}>
      <label className={styles.row}>
        <span className={styles.icon}>
          <Target size={18} aria-hidden />
        </span>
        <span className={styles.label}>{t("monthlyBudget")}</span>
        <input
          className={styles.input}
          inputMode="decimal"
          enterKeyHint="done"
          autoComplete="off"
          placeholder={t("noBudget")}
          value={editing ?? (budget ? formatAmountField(budget, locale) : "")}
          onFocus={(event) => {
            setEditing(event.currentTarget.value);
          }}
          onChange={(event) => {
            setEditing(event.target.value);
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
        />
        <span className={styles.currency}>€</span>
      </label>
    </ListGroup>
  );
}
