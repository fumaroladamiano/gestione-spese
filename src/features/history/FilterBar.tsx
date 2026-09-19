import { Calendar, X } from "lucide-react";
import { Chip } from "../../components/Chip";
import { formatMonthYear, formatRelativeDay } from "../../domain/dates";
import { isDefaultFilters, type HistoryFilters } from "../../domain/filters";
import { useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import { useCategoryMap, useCategoryName } from "../categories/useCategories";
import styles from "./FilterBar.module.css";

type FilterBarProps = {
  filters: HistoryFilters;
  today: string;
  onOpen: () => void;
  onChange: (filters: HistoryFilters) => void;
  onReset: () => void;
};

/** Chip scorrevoli con lo stato dei filtri: toccarli apre il foglio Filtri. */
export function FilterBar({
  filters,
  today,
  onOpen,
  onChange,
  onReset,
}: FilterBarProps) {
  const t = useT();
  const language = usePrefs((state) => state.language);
  const categories = useCategoryMap();
  const nameOf = useCategoryName();
  const [firstId] = filters.categoryIds;
  const single =
    filters.categoryIds.length === 1 && firstId
      ? categories.get(firstId)
      : undefined;

  const categoryLabel =
    filters.categoryIds.length === 0
      ? t("categories")
      : single
        ? nameOf(single)
        : t("nCategories", filters.categoryIds.length);

  return (
    <div className={styles.bar}>
      <Chip
        icon={Calendar}
        caret
        selected={filters.month !== null}
        label={
          filters.month === null
            ? t("allMonths")
            : formatMonthYear(filters.month, language)
        }
        onClick={onOpen}
      />
      <Chip
        caret
        selected={filters.categoryIds.length > 0}
        label={categoryLabel}
        dot={
          single
            ? { light: single.colorLight, dark: single.colorDark }
            : undefined
        }
        onClick={onOpen}
      />
      <Chip
        caret
        selected={filters.day !== null}
        label={
          filters.day === null
            ? t("day")
            : formatRelativeDay(filters.day, today, language, {
                today: t("today"),
                yesterday: t("yesterday"),
              })
        }
        onClick={onOpen}
      />
      {filters.query.trim() !== "" ? (
        <Chip
          icon={X}
          selected
          label={t("searchChip", filters.query.trim())}
          ariaLabel={t("removeSearch")}
          onClick={() => {
            onChange({ ...filters, query: "" });
          }}
        />
      ) : null}
      {isDefaultFilters(filters, today) ? null : (
        <button type="button" className={styles.reset} onClick={onReset}>
          {t("reset")}
        </button>
      )}
    </div>
  );
}
