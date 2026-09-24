import { ReceiptText, SearchX } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useToday } from "../../app/useToday";
import { AmountText } from "../../components/AmountText";
import { EmptyState } from "../../components/EmptyState";
import { ExpenseRow } from "../../components/ExpenseRow";
import { Page } from "../../components/Page";
import { formatDayHeader } from "../../domain/dates";
import { filtersFromSearch } from "../../domain/filterParams";
import {
  defaultFilters,
  filtersToSearch,
  isDefaultFilters,
  type HistoryFilters,
} from "../../domain/filters";
import { useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import { useUi } from "../../stores/ui";
import { useExpenseRow } from "../expense/useExpenseRow";
import { FilterBar } from "./FilterBar";
import { FilterSheet } from "./FilterSheet";
import styles from "./HistoryPage.module.css";
import { TotalBanner } from "./TotalBanner";
import { useHistory } from "./useHistory";

export function HistoryPage() {
  const t = useT();
  const language = usePrefs((state) => state.language);
  const openNewExpense = useUi((state) => state.openNewExpense);
  const rowProps = useExpenseRow();
  const today = useToday();
  const [searchParams, setSearchParams] = useSearchParams();
  // i filtri vivono nell'indirizzo: riaprendo l'app la vista filtrata viene ripristinata
  const filters = useMemo(
    () => filtersFromSearch(searchParams, today),
    [searchParams, today],
  );
  const [sheet, setSheet] = useState({ open: false, session: 0 });
  const result = useHistory(filters);
  const labels = { today: t("today"), yesterday: t("yesterday") };

  const setFilters = (next: HistoryFilters) => {
    setSearchParams(filtersToSearch(next, today), { replace: true });
  };
  const openSheet = () => {
    setSheet((current) => ({ open: true, session: current.session + 1 }));
  };
  const closeSheet = () => {
    setSheet((current) => ({ ...current, open: false }));
  };
  const reset = () => {
    setFilters(defaultFilters(today));
  };

  return (
    <Page title={t("historyTitle")}>
      <FilterBar
        filters={filters}
        today={today}
        onOpen={openSheet}
        onChange={setFilters}
        onReset={reset}
      />
      {result ? (
        <TotalBanner totalCents={result.totalCents} count={result.count} />
      ) : null}

      {result?.count === 0 ? (
        isDefaultFilters(filters, today) ? (
          <EmptyState
            icon={ReceiptText}
            title={t("noExpensesTitle")}
            message={t("historyEmpty")}
            action={{ label: t("addExpense"), onClick: openNewExpense }}
          />
        ) : (
          <EmptyState
            icon={SearchX}
            title={t("noExpensesTitle")}
            message={t("noMatch")}
            action={{ label: t("clearFilters"), onClick: reset }}
          />
        )
      ) : null}

      {result?.groups.map((group) => (
        <section key={group.date} className={styles.day}>
          <h2 className={styles.dayHeader}>
            <span>{formatDayHeader(group.date, today, language, labels)}</span>
            <AmountText cents={group.totalCents} className={styles.dayTotal} />
          </h2>
          <div className={styles.card}>
            <AnimatePresence initial={false}>
              {group.expenses.map((expense) => (
                <m.div
                  key={expense.id}
                  className={styles.item}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.26 }}
                >
                  <ExpenseRow {...rowProps(expense)} />
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      ))}

      <FilterSheet
        key={sheet.session}
        open={sheet.open}
        initial={filters}
        onApply={(next) => {
          setFilters(next);
          closeSheet();
          window.scrollTo({ top: 0 });
        }}
        onClose={closeSheet}
      />
    </Page>
  );
}
