import { Calendar, ReceiptText, TrendingUp } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { ExpenseRow } from "../../components/ExpenseRow";
import { Page } from "../../components/Page";
import { SectionHeader } from "../../components/SectionHeader";
import { formatLongDate, todayISO } from "../../domain/dates";
import { useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import { useUi } from "../../stores/ui";
import { useExpenseRow } from "../expense/useExpenseRow";
import styles from "./HomePage.module.css";
import { MonthHeroCard } from "./MonthHeroCard";
import { Sparkline } from "./Sparkline";
import { StatTile } from "./StatTile";
import { TopCategories } from "./TopCategories";
import { useMonthSummary } from "./useMonthSummary";

export function HomePage() {
  const t = useT();
  const language = usePrefs((state) => state.language);
  const openNewExpense = useUi((state) => state.openNewExpense);
  const summary = useMonthSummary();
  const rowProps = useExpenseRow();

  return (
    <Page title={t("homeTitle")} caption={formatLongDate(todayISO(), language)}>
      {summary ? (
        <>
          <MonthHeroCard
            month={summary.month}
            totalCents={summary.totalCents}
            comparison={summary.comparison}
          />
          <div className={styles.tiles}>
            <StatTile
              icon={Calendar}
              label={t("today")}
              cents={summary.todayCents}
              sub={t("nExpenses", summary.todayCount)}
            />
            <StatTile
              icon={TrendingUp}
              label={t("averagePerDay")}
              cents={summary.averageCents}
            >
              <Sparkline
                values={summary.lastSevenDays}
                label={t("lastSevenDays")}
              />
            </StatTile>
          </div>

          {summary.topCategories.length > 0 ? (
            <>
              <SectionHeader
                title={t("topCategories")}
                link={{ label: t("tabCharts"), to: "/charts" }}
              />
              <TopCategories totals={summary.topCategories} />
            </>
          ) : null}

          <SectionHeader
            title={t("recentExpenses")}
            link={
              summary.isEmpty
                ? undefined
                : { label: t("seeAll"), to: "/history" }
            }
          />
          {summary.isEmpty ? (
            <div className={styles.card}>
              <EmptyState
                icon={ReceiptText}
                title={t("noExpensesTitle")}
                message={t("firstExpenseHint")}
                action={{ label: t("addExpense"), onClick: openNewExpense }}
              />
            </div>
          ) : (
            <div className={styles.card}>
              {summary.recent.map((expense) => (
                <div key={expense.id} className={styles.item}>
                  <ExpenseRow {...rowProps(expense, { showDate: true })} />
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </Page>
  );
}
