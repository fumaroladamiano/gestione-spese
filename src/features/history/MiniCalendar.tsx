import { classNames } from "../../components/classNames";
import {
  daysInMonth,
  formatLongDate,
  mondayBasedWeekday,
  weekdayInitials,
  type DateLanguage,
} from "../../domain/dates";
import type { ISODate, MonthKey } from "../../domain/types";
import styles from "./MiniCalendar.module.css";

type MiniCalendarProps = {
  month: MonthKey;
  selected: ISODate | null;
  today: ISODate;
  markedDays: ReadonlySet<ISODate>;
  language: DateLanguage;
  onSelect: (day: ISODate) => void;
};

/** Calendario del mese (settimana da lunedì), puntino sui giorni con spese, futuri disattivati. */
export function MiniCalendar({
  month,
  selected,
  today,
  markedDays,
  language,
  onSelect,
}: MiniCalendarProps) {
  const days = Array.from(
    { length: daysInMonth(month) },
    (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`,
  );
  const firstDay = days[0] ?? `${month}-01`;
  const offset = mondayBasedWeekday(firstDay);

  return (
    <div className={styles.grid}>
      {weekdayInitials(language).map((initial, index) => (
        // la posizione identifica il giorno (L M M G…: iniziali ripetute)
        <span key={index} className={styles.weekday} aria-hidden>
          {initial}
        </span>
      ))}
      {Array.from({ length: offset }, (_, index) => (
        <span key={`empty-${String(index)}`} />
      ))}
      {days.map((day, index) => (
        <button
          key={day}
          type="button"
          className={classNames(
            styles.day,
            markedDays.has(day) && styles.marked,
            day === today && styles.today,
            day === selected && styles.selected,
          )}
          disabled={day > today}
          aria-pressed={day === selected}
          aria-label={formatLongDate(day, language)}
          onClick={() => {
            onSelect(day);
          }}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}
