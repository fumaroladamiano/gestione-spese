import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AmountText } from "../../components/AmountText";
import { DeltaPill } from "../../components/DeltaPill";
import { MonthSwitcher } from "../../components/MonthSwitcher";
import { Page } from "../../components/Page";
import { SectionHeader } from "../../components/SectionHeader";
import {
  capitalizeFirst,
  dayOfMonth,
  formatDayHeader,
  formatMonthName,
  isMonthKey,
  monthOf,
  todayISO,
} from "../../domain/dates";
import { filtersToSearch } from "../../domain/filters";
import { formatAmount } from "../../domain/money";
import type { MonthKey } from "../../domain/types";
import { useLocale, useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import { useMonthBounds } from "../history/useHistory";
import { CategoryBreakdown } from "./CategoryBreakdown";
import styles from "./ChartsPage.module.css";
import { DailyBarChart } from "./DailyBarChart";
import { useChartsData } from "./useChartsData";

export function ChartsPage() {
  const t = useT();
  const locale = useLocale();
  const language = usePrefs((state) => state.language);
  const navigate = useNavigate();
  const today = todayISO();
  const [searchParams, setSearchParams] = useSearchParams();
  // mese nell'indirizzo (#/charts?month=2026-08), validato; non oltre il mese corrente
  const requested = searchParams.get("month");
  const month: MonthKey =
    isMonthKey(requested) && requested <= monthOf(today)
      ? requested
      : monthOf(today);
  const bounds = useMonthBounds();
  const data = useChartsData(month);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const changeMonth = (next: MonthKey) => {
    setSelectedCategory(null);
    setSelectedDay(null);
    setSearchParams(next === monthOf(today) ? "" : `month=${next}`, {
      replace: true,
    });
  };

  const openHistory = (categoryIds: string[], day: string | null) => {
    const search = filtersToSearch(
      { month, categoryIds, day, query: "" },
      today,
    );
    void navigate(search ? `/history?${search}` : "/history");
  };

  const previousName = capitalizeFirst(
    formatMonthName(data?.comparison.previousMonth ?? month, language),
  );
  const selectedIso =
    selectedDay === null
      ? null
      : `${month}-${String(selectedDay).padStart(2, "0")}`;
  const dayLabels = { today: t("today"), yesterday: t("yesterday") };

  return (
    <Page title={t("chartsTitle")}>
      <MonthSwitcher
        month={month}
        onChange={changeMonth}
        min={bounds.min < month ? bounds.min : month}
        max={bounds.max}
        language={language}
        labels={{ previous: t("previousMonth"), next: t("nextMonth") }}
      />
      {data ? (
        <>
          <SectionHeader title={t("summary")} />
          <section className={styles.card}>
            <span className={styles.eyebrow}>{t("monthTotal")}</span>
            <AmountText cents={data.totalCents} className={styles.bigAmount} />
            <div className={styles.delta}>
              <DeltaPill
                change={data.comparison.change}
                locale={locale}
                noComparisonLabel={t("noComparison")}
              />
            </div>
            <p className={styles.previous}>
              {t(
                "previousTotal",
                data.comparison.samePeriod
                  ? t("monthUntilDay", previousName, dayOfMonth(today))
                  : previousName,
                formatAmount(data.comparison.previousCents, locale),
              )}
            </p>
          </section>

          <SectionHeader title={t("byCategory")} />
          <CategoryBreakdown
            totals={data.byCategory}
            totalCents={data.totalCents}
            selected={selectedCategory}
            onSelect={(id) => {
              setSelectedCategory((current) => (current === id ? null : id));
            }}
            onOpenHistory={(id) => {
              openHistory([id], null);
            }}
          />

          <SectionHeader title={t("dailyTrend")} />
          <section className={styles.card}>
            <div className={styles.barHead}>
              {selectedIso && selectedDay !== null ? (
                <>
                  <span>
                    {t(
                      "dayAmount",
                      formatDayHeader(selectedIso, today, language, dayLabels),
                      formatAmount(data.daily[selectedDay - 1] ?? 0, locale),
                    )}
                  </span>
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => {
                      openHistory([], selectedIso);
                    }}
                  >
                    {t("openDay")}
                    <ChevronRight size={16} strokeWidth={2.4} aria-hidden />
                  </button>
                </>
              ) : (
                <>
                  <span className={styles.hint}>{t("tapBarHint")}</span>
                  <span className={styles.hint}>
                    {t(
                      "averagePerDayShort",
                      formatAmount(data.averageCents, locale, {
                        wholeEuros: true,
                      }),
                    )}
                  </span>
                </>
              )}
            </div>
            <DailyBarChart
              values={data.daily}
              todayDay={data.isCurrentMonth ? dayOfMonth(today) : null}
              averageCents={data.averageCents}
              averageLabel={t("averageLine")}
              selectedDay={selectedDay}
              onSelect={(day) => {
                setSelectedDay((current) => (current === day ? null : day));
              }}
              barLabel={(day, cents) =>
                t(
                  "dayAmount",
                  formatDayHeader(
                    `${month}-${String(day).padStart(2, "0")}`,
                    today,
                    language,
                    dayLabels,
                  ),
                  formatAmount(cents, locale),
                )
              }
            />
          </section>
        </>
      ) : null}
    </Page>
  );
}
