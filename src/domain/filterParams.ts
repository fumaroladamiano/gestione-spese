import { z } from "zod";
import { isISODate, isMonthKey, monthOf } from "./dates";
import { defaultFilters, type HistoryFilters } from "./filters";
import type { ISODate } from "./types";

// I parametri dell'indirizzo sono dati esterni: si validano con zod (typescript-codice.md).
// Un valore non valido viene scartato e sostituito da quello predefinito.
const monthParam = z.union([z.literal("all"), z.string().refine(isMonthKey)]);
const dayParam = z.string().refine(isISODate);
const categoryId = z.string().regex(/^[\w-]{1,64}$/);
const queryParam = z.string().max(40);

/** Legge i filtri dalla query dell'indirizzo, scartando i valori non validi. */
export function filtersFromSearch(
  search: URLSearchParams,
  today: ISODate,
): HistoryFilters {
  const defaults = defaultFilters(today);

  const month = monthParam.safeParse(search.get("month"));
  const day = dayParam.safeParse(search.get("day"));
  const query = queryParam.safeParse(search.get("q"));
  const categoryIds = (search.get("cat") ?? "")
    .split(",")
    .filter((id) => categoryId.safeParse(id).success);

  const filters: HistoryFilters = {
    month: month.success
      ? month.data === "all"
        ? null
        : month.data
      : defaults.month,
    categoryIds: [...new Set(categoryIds)],
    day: day.success && day.data <= today ? day.data : null,
    query: query.success ? query.data : "",
  };
  // il giorno scelto determina sempre il mese
  return filters.day === null
    ? filters
    : { ...filters, month: monthOf(filters.day) };
}
