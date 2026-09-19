import { useState } from "react";
import { Chip } from "../../components/Chip";
import { classNames } from "../../components/classNames";
import { MonthSwitcher } from "../../components/MonthSwitcher";
import { Sheet } from "../../components/Sheet";
import { SheetHeader } from "../../components/SheetHeader";
import { Toggle } from "../../components/Toggle";
import { monthOf, todayISO } from "../../domain/dates";
import {
  changeMonth,
  defaultFilters,
  toggleCategory,
  toggleDay,
  type HistoryFilters,
} from "../../domain/filters";
import { formatAmount } from "../../domain/money";
import { LIMITS } from "../../domain/types";
import { useLocale, useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import { useCategories, useCategoryName } from "../categories/useCategories";
import styles from "./FilterSheet.module.css";
import { MiniCalendar } from "./MiniCalendar";
import { useFilterPreview, useMonthBounds } from "./useHistory";

type FilterSheetProps = {
  open: boolean;
  /** Filtri attuali, letti solo all'apertura (il foglio si rimonta a ogni apertura). */
  initial: HistoryFilters;
  onApply: (filters: HistoryFilters) => void;
  onClose: () => void;
};

/** Foglio filtri: mese, categorie, giorno e ricerca, con anteprima dal vivo del risultato. */
export function FilterSheet({
  open,
  initial,
  onApply,
  onClose,
}: FilterSheetProps) {
  const t = useT();
  const locale = useLocale();
  const language = usePrefs((state) => state.language);
  const [today] = useState(() => todayISO());
  const [draft, setDraft] = useState(initial);
  // mese mostrato dal calendario anche quando è attivo "Tutti i mesi"
  const [calendarMonth, setCalendarMonth] = useState(
    initial.month ?? monthOf(initial.day ?? today),
  );
  const bounds = useMonthBounds();
  const categories = useCategories() ?? [];
  const nameOf = useCategoryName();
  const preview = useFilterPreview(draft, draft.month ?? calendarMonth);

  // categorie archiviate visibili solo se già selezionate
  const visibleCategories = categories.filter(
    (category) => !category.archived || draft.categoryIds.includes(category.id),
  );

  const selectMonth = (month: string) => {
    setCalendarMonth(month);
    setDraft((current) => changeMonth(current, month));
  };

  return (
    <Sheet
      open={open}
      onRequestClose={onClose}
      label={t("filters")}
      header={
        <SheetHeader
          title={t("filters")}
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={t("reset")}
          onAction={() => {
            setDraft(defaultFilters(today));
            setCalendarMonth(monthOf(today));
          }}
          subtle
        />
      }
      footer={
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.apply}
            onClick={() => {
              onApply(draft);
            }}
          >
            {preview
              ? t(
                  "showResults",
                  t("nExpenses", preview.count),
                  formatAmount(preview.totalCents, locale),
                )
              : t("filters")}
          </button>
        </div>
      }
    >
      <h3 className={styles.title}>{t("month")}</h3>
      <section className={styles.card}>
        <MonthSwitcher
          month={draft.month ?? calendarMonth}
          onChange={selectMonth}
          min={bounds.min}
          max={bounds.max}
          language={language}
          labels={{ previous: t("previousMonth"), next: t("nextMonth") }}
          muted={draft.month === null}
          inline
        />
        <div className={styles.divider} />
        <Toggle
          label={t("allMonths")}
          checked={draft.month === null}
          onChange={(all) => {
            setDraft((current) =>
              changeMonth(current, all ? null : calendarMonth),
            );
          }}
        />
      </section>

      <h3 className={styles.title}>
        {t("categories")}
        <span className={styles.hint}>{t("oneOrMore")}</span>
      </h3>
      <section className={classNames(styles.card, styles.chips)}>
        {visibleCategories.map((category) => (
          <Chip
            key={category.id}
            variant="soft"
            label={nameOf(category)}
            dot={{ light: category.colorLight, dark: category.colorDark }}
            selected={draft.categoryIds.includes(category.id)}
            onClick={() => {
              setDraft((current) => toggleCategory(current, category.id));
            }}
          />
        ))}
      </section>

      <h3 className={styles.title}>
        {t("day")}
        {draft.day !== null ? (
          <button
            type="button"
            className={styles.link}
            onClick={() => {
              setDraft((current) => ({ ...current, day: null }));
            }}
          >
            {t("anyDay")}
          </button>
        ) : null}
      </h3>
      <section className={styles.card}>
        <MiniCalendar
          month={draft.month ?? calendarMonth}
          selected={draft.day}
          today={today}
          markedDays={preview?.markedDays ?? new Set()}
          language={language}
          onSelect={(day) => {
            setCalendarMonth(monthOf(day));
            setDraft((current) => toggleDay(current, day));
          }}
        />
      </section>

      <h3 className={styles.title}>{t("searchNotes")}</h3>
      <input
        className={styles.search}
        type="search"
        aria-label={t("searchNotes")}
        placeholder={t("searchPlaceholder")}
        maxLength={LIMITS.noteLength}
        autoComplete="off"
        enterKeyHint="search"
        value={draft.query}
        onChange={(event) => {
          const query = event.target.value;
          setDraft((current) => ({ ...current, query }));
        }}
      />
    </Sheet>
  );
}
