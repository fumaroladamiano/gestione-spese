import {
  addDays as addDaysToDate,
  addMonths as addMonthsToDate,
  differenceInCalendarDays,
  format,
  getDaysInMonth,
  isValid,
  parse,
} from "date-fns";
import { enIE, it } from "date-fns/locale";
import type { ISODate, MonthKey } from "./types";

/** Lingua delle date: it → "mercoledì 16 settembre", en → "Wednesday 16 September". */
export type DateLanguage = "it" | "en";

const DATE_LOCALES = { it, en: enIE } as const;
const ISO_FORMAT = "yyyy-MM-dd";

/** Etichette tradotte per i giorni relativi, passate dalla UI (il dominio non legge i dizionari). */
export type RelativeDayLabels = { today: string; yesterday: string };

function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

/** Data locale (non UTC) nel formato YYYY-MM-DD. */
export function toISODate(date: Date): ISODate {
  return format(date, ISO_FORMAT);
}

/** "2026-09-16" → Date alle 00:00 locali (niente spostamenti di fuso orario). */
export function parseISODate(iso: ISODate): Date {
  return parse(iso, ISO_FORMAT, new Date(2000, 0, 1));
}

/** true solo per date reali nel formato YYYY-MM-DD (niente 2026-02-30). */
export function isISODate(value: unknown): value is ISODate {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = parseISODate(value);
  return isValid(date) && toISODate(date) === value;
}

export function isMonthKey(value: unknown): value is MonthKey {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}$/.test(value) &&
    isISODate(`${value}-01`)
  );
}

export function todayISO(now: Date = new Date()): ISODate {
  return toISODate(now);
}

export function addDays(iso: ISODate, days: number): ISODate {
  return toISODate(addDaysToDate(parseISODate(iso), days));
}

export function monthOf(iso: ISODate): MonthKey {
  return iso.slice(0, 7);
}

export function addMonths(month: MonthKey, months: number): MonthKey {
  return monthOf(
    toISODate(addMonthsToDate(parseISODate(`${month}-01`), months)),
  );
}

export function daysInMonth(month: MonthKey): number {
  return getDaysInMonth(parseISODate(`${month}-01`));
}

/** Primo e ultimo giorno del mese, per le query per intervallo. */
export function monthRange(month: MonthKey): { start: ISODate; end: ISODate } {
  return {
    start: `${month}-01`,
    end: `${month}-${String(daysInMonth(month)).padStart(2, "0")}`,
  };
}

export function dayOfMonth(iso: ISODate): number {
  return Number.parseInt(iso.slice(8, 10), 10);
}

/** Giorni di calendario da `from` a `to` (negativo se `to` è prima). */
export function daysBetween(from: ISODate, to: ISODate): number {
  return differenceInCalendarDays(parseISODate(to), parseISODate(from));
}

/** "Mercoledì 16 settembre" / "Wednesday 16 September" (data sopra il titolo della Home). */
export function formatLongDate(iso: ISODate, language: DateLanguage): string {
  return capitalize(
    format(parseISODate(iso), "EEEE d MMMM", {
      locale: DATE_LOCALES[language],
    }),
  );
}

/** "16 set" / "16 Sep" (senza anno). */
export function formatShortDate(iso: ISODate, language: DateLanguage): string {
  return format(parseISODate(iso), "d MMM", {
    locale: DATE_LOCALES[language],
  });
}

/** "Oggi", "Ieri" oppure "16 set": sottotitolo delle righe spesa. */
export function formatRelativeDay(
  iso: ISODate,
  today: ISODate,
  language: DateLanguage,
  labels: RelativeDayLabels,
): string {
  if (iso === today) return labels.today;
  if (iso === addDays(today, -1)) return labels.yesterday;
  return formatShortDate(iso, language);
}

/**
 * Intestazione di un giorno nello Storico: "Oggi · mer 16 set", "Ieri · mar 15 set",
 * "Lunedì 14 settembre" (con l'anno se diverso da quello corrente).
 */
export function formatDayHeader(
  iso: ISODate,
  today: ISODate,
  language: DateLanguage,
  labels: RelativeDayLabels,
): string {
  const locale = DATE_LOCALES[language];
  const date = parseISODate(iso);
  const short = format(date, "EEE d MMM", { locale });
  if (iso === today) return `${labels.today} · ${short}`;
  if (iso === addDays(today, -1)) return `${labels.yesterday} · ${short}`;
  const sameYear = iso.slice(0, 4) === today.slice(0, 4);
  return capitalize(
    format(date, sameYear ? "EEEE d MMMM" : "EEEE d MMMM yyyy", { locale }),
  );
}

/** "settembre" / "September": nome del mese dentro una frase. */
export function formatMonthName(
  month: MonthKey,
  language: DateLanguage,
): string {
  return format(parseISODate(`${month}-01`), "LLLL", {
    locale: DATE_LOCALES[language],
  });
}

/** "Settembre 2026" / "September 2026". */
export function formatMonthYear(
  month: MonthKey,
  language: DateLanguage,
): string {
  return capitalize(
    format(parseISODate(`${month}-01`), "LLLL yyyy", {
      locale: DATE_LOCALES[language],
    }),
  );
}

/** Iniziali dei giorni della settimana, sempre da lunedì: L M M G V S D / M T W T F S S. */
export function weekdayInitials(language: DateLanguage): string[] {
  const monday = parseISODate("2026-01-05");
  return Array.from({ length: 7 }, (_, index) =>
    format(addDaysToDate(monday, index), "EEEEE", {
      locale: DATE_LOCALES[language],
    }).toLocaleUpperCase(),
  );
}

/** Posizione del giorno nella settimana che parte da lunedì (0 = lunedì, 6 = domenica). */
export function mondayBasedWeekday(iso: ISODate): number {
  return (parseISODate(iso).getDay() + 6) % 7;
}
