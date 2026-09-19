import type { Expense } from "./types";

/** Byte order mark: fa riconoscere a Excel la codifica UTF-8. */
const BOM = String.fromCharCode(0xfeff);

const HEADER = [
  "data",
  "categoria",
  "importo_eur",
  "descrizione",
  "metodo",
  "ricorrente",
];

// CSV sempre in formato italiano (virgola decimale, niente separatore delle migliaia),
// qualunque sia la lingua dell'app: così si apre correttamente in Excel italiano
const AMOUNT = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

/** Racchiude tra virgolette i campi con separatore, virgolette o a capo. */
function field(value: string): string {
  return /[;"\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Esportazione per Excel: separatore ";", virgola decimale, intestazioni in italiano,
 * BOM iniziale perché Excel riconosca l'UTF-8 (accenti corretti).
 * I nomi di categoria e metodo vanno passati già in italiano.
 */
export function buildCsv(
  expenses: readonly Expense[],
  categoryName: (categoryId: string) => string,
  paymentName: (expense: Expense) => string,
): string {
  const rows = expenses.map((expense) =>
    [
      expense.date,
      field(categoryName(expense.categoryId)),
      AMOUNT.format(expense.amountCents / 100),
      field(expense.note),
      field(paymentName(expense)),
      expense.recurringRuleId === undefined ? "no" : "sì",
    ].join(";"),
  );
  return `${BOM}${[HEADER.join(";"), ...rows].join("\r\n")}\r\n`;
}
