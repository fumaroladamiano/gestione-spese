import { monthOf, monthRange } from "./dates";
import type { Expense, ISODate, MonthKey } from "./types";

/** Filtri dello Storico: tra tipi diversi vale AND, tra più categorie OR. */
export type HistoryFilters = {
  /** null = tutti i mesi. */
  month: MonthKey | null;
  /** Vuoto = tutte le categorie. */
  categoryIds: string[];
  day: ISODate | null;
  /** Testo cercato nelle note ("" = nessuna ricerca). */
  query: string;
};

/** Filtri predefiniti: mese corrente, tutte le categorie, qualsiasi giorno. */
export function defaultFilters(today: ISODate): HistoryFilters {
  return { month: monthOf(today), categoryIds: [], day: null, query: "" };
}

export function isDefaultFilters(
  filters: HistoryFilters,
  today: ISODate,
): boolean {
  return (
    filters.month === monthOf(today) &&
    filters.categoryIds.length === 0 &&
    filters.day === null &&
    filters.query.trim() === ""
  );
}

/** Intervallo di date da leggere dal database per questi filtri. */
export function filterDateRange(filters: HistoryFilters): {
  start: ISODate;
  end: ISODate;
} {
  if (filters.day !== null) return { start: filters.day, end: filters.day };
  if (filters.month !== null) return monthRange(filters.month);
  return { start: "0000-01-01", end: "9999-12-31" };
}

/** Testo per la ricerca: minuscolo e senza accenti ("Caffè" trova "caffe"). */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();
}

/** Applica tutti i filtri (usato anche per l'anteprima "Mostra N spese"). */
export function applyFilters(
  expenses: readonly Expense[],
  filters: HistoryFilters,
): Expense[] {
  const { start, end } = filterDateRange(filters);
  const categories = new Set(filters.categoryIds);
  const query = normalizeSearch(filters.query);
  return expenses.filter(
    (expense) =>
      expense.date >= start &&
      expense.date <= end &&
      (categories.size === 0 || categories.has(expense.categoryId)) &&
      (query === "" || normalizeSearch(expense.note).includes(query)),
  );
}

/** Scegliere un giorno imposta anche il suo mese; toccare di nuovo lo stesso giorno lo toglie. */
export function toggleDay(
  filters: HistoryFilters,
  day: ISODate,
): HistoryFilters {
  if (filters.day === day) return { ...filters, day: null };
  return { ...filters, day, month: monthOf(day) };
}

/** Cambiare mese azzera il giorno se non appartiene al nuovo mese. */
export function changeMonth(
  filters: HistoryFilters,
  month: MonthKey | null,
): HistoryFilters {
  const keepDay =
    filters.day !== null && month !== null && monthOf(filters.day) === month;
  return { ...filters, month, day: keepDay ? filters.day : null };
}

export function toggleCategory(
  filters: HistoryFilters,
  categoryId: string,
): HistoryFilters {
  const selected = filters.categoryIds.includes(categoryId);
  return {
    ...filters,
    categoryIds: selected
      ? filters.categoryIds.filter((id) => id !== categoryId)
      : [...filters.categoryIds, categoryId],
  };
}

/**
 * Filtri nella query dell'indirizzo (#/history?month=2026-09&cat=spesa,casa&day=…&q=…):
 * se iOS chiude l'app, riaprendola la vista filtrata viene ripristinata.
 * Il mese corrente non si scrive; "month=all" indica tutti i mesi.
 */
export function filtersToSearch(
  filters: HistoryFilters,
  today: ISODate,
): string {
  const params = new URLSearchParams();
  if (filters.month === null) params.set("month", "all");
  else if (filters.month !== monthOf(today)) params.set("month", filters.month);
  if (filters.categoryIds.length > 0)
    params.set("cat", filters.categoryIds.join(","));
  if (filters.day !== null) params.set("day", filters.day);
  if (filters.query.trim() !== "") params.set("q", filters.query.trim());
  return params.toString();
}
