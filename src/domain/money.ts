import { LIMITS } from "./types";

/** Locale dei numeri: it-IT (1.234,56 €) oppure en-IE (€1,234.56). */
export type NumberLocale = "it-IT" | "en-IE";

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function currencyFormatter(
  locale: NumberLocale,
  wholeEuros: boolean,
): Intl.NumberFormat {
  const key = `${locale}|${String(wholeEuros)}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      // la regola italiana non separa le migliaia a 4 cifre (1500 €): si forza il separatore
      useGrouping: "always",
      ...(wholeEuros
        ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
        : {}),
    });
    currencyFormatters.set(key, formatter);
  }
  return formatter;
}

type FormatOptions = {
  /** Senza decimali (es. "1.500 €" per il budget). */
  wholeEuros?: boolean;
};

/** Importo in euro nella lingua attiva: 123456 → "1.234,56 €" / "€1,234.56". */
export function formatAmount(
  cents: number,
  locale: NumberLocale,
  { wholeEuros = false }: FormatOptions = {},
): string {
  return currencyFormatter(locale, wholeEuros).format(cents / 100);
}

export type AmountPart = {
  kind: "main" | "fraction" | "currency";
  value: string;
};

/**
 * Importo diviso in parti per attenuare decimali e simbolo (card del mese):
 * separatore decimale e decimali sono "fraction", il simbolo è "currency".
 */
export function formatAmountParts(
  cents: number,
  locale: NumberLocale,
): AmountPart[] {
  return currencyFormatter(locale, false)
    .formatToParts(cents / 100)
    .map((part) => ({
      kind:
        part.type === "decimal" || part.type === "fraction"
          ? "fraction"
          : part.type === "currency"
            ? "currency"
            : "main",
      value: part.value,
    }));
}

/** Percentuale arrotondata all'intero: 0.123 → "12%", con segno se richiesto ("+12%"). */
export function formatPercent(
  ratio: number,
  locale: NumberLocale,
  { signed = false }: { signed?: boolean } = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(ratio);
}

/** Separatore decimale della lingua (tasto del tastierino): "," oppure ".". */
export function decimalSeparator(locale: NumberLocale): string {
  return (
    new Intl.NumberFormat(locale)
      .formatToParts(1.5)
      .find((part) => part.type === "decimal")?.value ?? ","
  );
}

/** Il simbolo € va prima dell'importo (en-IE) o dopo (it-IT). */
export function currencyBeforeAmount(locale: NumberLocale): boolean {
  const parts = currencyFormatter(locale, false).formatToParts(1);
  return (
    parts.findIndex((part) => part.type === "currency") <
    parts.findIndex((part) => part.type === "integer")
  );
}

/* ---------- Tastierino ----------
   L'importo digitato è una stringa con il punto come separatore interno ("12.5"):
   la lingua cambia solo la visualizzazione, i calcoli avvengono in centesimi. */

export const KEYPAD_DIGITS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
] as const;
export type KeypadKey =
  (typeof KEYPAD_DIGITS)[number] | "decimal" | "backspace";

/**
 * Applica un tasto all'importo digitato. Restituisce null se il tasto va rifiutato
 * (separatore doppio, terzo decimale, oltre 6 cifre intere): la UI mostra lo "shake".
 */
export function pressKey(input: string, key: KeypadKey): string | null {
  if (key === "backspace") return input.slice(0, -1);
  if (key === "decimal") {
    if (input.includes(".")) return null;
    return `${input === "" ? "0" : input}.`;
  }
  const [integer = "", decimals] = input.split(".");
  if (decimals !== undefined) {
    return decimals.length >= 2 ? null : input + key;
  }
  if (integer === "0") return key;
  if (integer.length >= LIMITS.maxIntegerDigits) return null;
  return input + key;
}

/** "12.5" → 1250; stringa vuota → 0. */
export function inputToCents(input: string): number {
  if (input === "") return 0;
  const [integer = "", decimals = ""] = input.split(".");
  return (
    Number.parseInt(integer || "0", 10) * 100 +
    Number.parseInt(decimals.padEnd(2, "0").slice(0, 2), 10)
  );
}

/** 1250 → "12.5", 1200 → "12", 5 → "0.05": per modificare una spesa esistente. */
export function centsToInput(cents: number): string {
  const integer = Math.floor(cents / 100);
  const decimals = cents % 100;
  if (decimals === 0) return String(integer);
  return `${String(integer)}.${String(decimals).padStart(2, "0").replace(/0$/, "")}`;
}

export type InputDisplay = {
  /** Parte intera con separatore delle migliaia ("1.234"), "0" se non si è digitato nulla. */
  integer: string;
  /** Separatore decimale digitato, oppure "" se non ancora digitato. */
  separator: string;
  /** Decimali già digitati. */
  decimals: string;
  /** Parte "fantasma" in grigio: separatore e zeri ancora da digitare (",00", "0"). */
  ghost: string;
  currencyBefore: boolean;
};

/** Come mostrare l'importo mentre si digita: "12,5" + "0" fantasma + " €". */
export function formatInput(input: string, locale: NumberLocale): InputDisplay {
  const separator = decimalSeparator(locale);
  const currencyBefore = currencyBeforeAmount(locale);
  if (input === "") {
    return {
      integer: "",
      separator: "",
      decimals: "",
      ghost: `0${separator}00`,
      currencyBefore,
    };
  }
  const [integer = "0", decimals] = input.split(".");
  const grouped = new Intl.NumberFormat(locale, {
    useGrouping: "always",
  }).format(Number.parseInt(integer || "0", 10));
  if (decimals === undefined) {
    return {
      integer: grouped,
      separator: "",
      decimals: "",
      ghost: `${separator}00`,
      currencyBefore,
    };
  }
  return {
    integer: grouped,
    separator,
    decimals,
    ghost: "0".repeat(2 - decimals.length),
    currencyBefore,
  };
}

/**
 * Legge un importo scritto in un campo di testo nel formato della lingua
 * ("1.234,50" in italiano, "1,234.50" in inglese). null se non valido.
 */
export function parseLocaleAmount(
  text: string,
  locale: NumberLocale,
): number | null {
  const compact = text.replace(/[\s €]/g, "");
  const normalized =
    locale === "it-IT"
      ? compact.replace(/\./g, "").replace(",", ".")
      : compact.replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const cents = inputToCents(normalized);
  return cents > LIMITS.maxAmountCents ? null : cents;
}

/** Importo valido per una spesa: intero da 1 centesimo a 999.999,99 €. */
export function isValidAmount(cents: number): boolean {
  return Number.isInteger(cents) && cents > 0 && cents <= LIMITS.maxAmountCents;
}
