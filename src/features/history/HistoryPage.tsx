import { ReceiptText } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AmountText } from "../../components/AmountText";
import { EmptyState } from "../../components/EmptyState";
import { ExpenseRow } from "../../components/ExpenseRow";
import { Page } from "../../components/Page";
import { formatDayHeader, todayISO } from "../../domain/dates";
import { useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import { useUi } from "../../stores/ui";
import { useExpenseRow } from "../expense/useExpenseRow";
import styles from "./HistoryPage.module.css";
import { useHistory } from "./useHistory";

export function HistoryPage() {
  const t = useT();
  const language = usePrefs((state) => state.language);
  const openNewExpense = useUi((state) => state.openNewExpense);
  const groups = useHistory();
  const rowProps = useExpenseRow();
  const today = todayISO();
  const labels = { today: t("today"), yesterday: t("yesterday") };

  return (
    <Page title={t("historyTitle")}>
      {groups?.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={t("noExpensesTitle")}
          message={t("historyEmpty")}
          action={{ label: t("addExpense"), onClick: openNewExpense }}
        />
      ) : null}
      {groups?.map((group) => (
        <section key={group.date} className={styles.day}>
          <h2 className={styles.dayHeader}>
            <span>{formatDayHeader(group.date, today, language, labels)}</span>
            <AmountText cents={group.totalCents} className={styles.dayTotal} />
          </h2>
          <div className={styles.card}>
            <AnimatePresence initial={false}>
              {group.expenses.map((expense) => (
                <motion.div
                  key={expense.id}
                  className={styles.item}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.26 }}
                >
                  <ExpenseRow {...rowProps(expense)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      ))}
    </Page>
  );
}
