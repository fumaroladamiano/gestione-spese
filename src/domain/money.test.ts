import { describe, expect, it } from "vitest";
import {
  centsToInput,
  decimalSeparator,
  formatAmount,
  formatAmountParts,
  formatInput,
  formatPercent,
  inputToCents,
  isValidAmount,
  parseLocaleAmount,
  pressKey,
  type KeypadKey,
} from "./money";

// spazio non separabile che Intl mette tra importo e simbolo in italiano
const NBSP = String.fromCharCode(0xa0);

function type(keys: KeypadKey[], start = ""): string {
  let input = start;
  for (const key of keys) input = pressKey(input, key) ?? input;
  return input;
}

describe("formatAmount", () => {
  it("formatta in italiano con separatore delle migliaia anche a 4 cifre", () => {
    expect(formatAmount(150000, "it-IT", { wholeEuros: true })).toBe(
      `1.500${NBSP}€`,
    );
    expect(formatAmount(123456, "it-IT")).toBe(`1.234,56${NBSP}€`);
    expect(formatAmount(50, "it-IT")).toBe(`0,50${NBSP}€`);
    expect(formatAmount(99999999, "it-IT")).toBe(`999.999,99${NBSP}€`);
  });

  it("formatta in inglese con il simbolo davanti", () => {
    expect(formatAmount(150000, "en-IE")).toBe("€1,500.00");
    expect(formatAmount(123456, "en-IE")).toBe("€1,234.56");
    expect(formatAmount(150000, "en-IE", { wholeEuros: true })).toBe("€1,500");
  });

  it("divide l'importo per attenuare decimali e simbolo", () => {
    const parts = formatAmountParts(123450, "it-IT");
    expect(
      parts.filter((p) => p.kind === "fraction").map((p) => p.value),
    ).toEqual([",", "50"]);
    expect(parts.find((p) => p.kind === "currency")?.value).toBe("€");
  });
});

describe("formatPercent", () => {
  it("arrotonda e mostra il segno solo se richiesto", () => {
    expect(formatPercent(0.123, "it-IT")).toBe("12%");
    expect(formatPercent(0.123, "it-IT", { signed: true })).toBe("+12%");
    expect(formatPercent(-0.4, "en-IE", { signed: true })).toBe("-40%");
  });
});

describe("tastierino", () => {
  it("costruisce l'importo in centesimi", () => {
    expect(inputToCents(type(["1", "2", "decimal", "5"]))).toBe(1250);
    expect(inputToCents(type(["decimal", "0", "5"]))).toBe(5);
    expect(inputToCents("")).toBe(0);
    expect(inputToCents("12.")).toBe(1200);
  });

  it("rifiuta il separatore doppio", () => {
    expect(pressKey("12.", "decimal")).toBeNull();
    expect(pressKey("12.5", "decimal")).toBeNull();
  });

  it("rifiuta il terzo decimale", () => {
    expect(pressKey("12.50", "1")).toBeNull();
  });

  it("accetta al massimo 6 cifre intere", () => {
    expect(type(["9", "9", "9", "9", "9", "9"])).toBe("999999");
    expect(pressKey("999999", "9")).toBeNull();
    expect(pressKey("999999", "decimal")).toBe("999999.");
  });

  it("sostituisce lo zero iniziale e cancella l'ultima cifra", () => {
    expect(type(["0", "7"])).toBe("7");
    expect(pressKey("12.5", "backspace")).toBe("12.");
    expect(pressKey("", "backspace")).toBe("");
  });

  it("riporta un importo salvato nel formato del tastierino", () => {
    expect(centsToInput(1250)).toBe("12.5");
    expect(centsToInput(1200)).toBe("12");
    expect(centsToInput(1205)).toBe("12.05");
    expect(centsToInput(5)).toBe("0.05");
    expect(inputToCents(centsToInput(123456))).toBe(123456);
  });

  it("mostra le cifre mancanti come fantasma nel formato della lingua", () => {
    expect(formatInput("", "it-IT")).toMatchObject({
      integer: "",
      ghost: "0,00",
    });
    expect(formatInput("1234.5", "it-IT")).toMatchObject({
      integer: "1.234",
      separator: ",",
      decimals: "5",
      ghost: "0",
      currencyBefore: false,
    });
    expect(formatInput("1234", "en-IE")).toMatchObject({
      integer: "1,234",
      ghost: ".00",
      currencyBefore: true,
    });
  });

  it("usa il separatore decimale della lingua", () => {
    expect(decimalSeparator("it-IT")).toBe(",");
    expect(decimalSeparator("en-IE")).toBe(".");
  });
});

describe("parseLocaleAmount", () => {
  it("legge gli importi scritti in italiano", () => {
    expect(parseLocaleAmount("1.234,50", "it-IT")).toBe(123450);
    expect(parseLocaleAmount("1500", "it-IT")).toBe(150000);
    expect(parseLocaleAmount("12,5 €", "it-IT")).toBe(1250);
  });

  it("legge gli importi scritti in inglese", () => {
    expect(parseLocaleAmount("1,234.50", "en-IE")).toBe(123450);
    expect(parseLocaleAmount("€12.5", "en-IE")).toBe(1250);
  });

  it("rifiuta testo non valido o importi oltre il massimo", () => {
    expect(parseLocaleAmount("", "it-IT")).toBeNull();
    expect(parseLocaleAmount("abc", "it-IT")).toBeNull();
    expect(parseLocaleAmount("1,234", "it-IT")).toBeNull();
    expect(parseLocaleAmount("1000000", "it-IT")).toBeNull();
  });
});

describe("isValidAmount", () => {
  it("accetta solo interi da 1 a 99.999.999 centesimi", () => {
    expect(isValidAmount(1)).toBe(true);
    expect(isValidAmount(99999999)).toBe(true);
    expect(isValidAmount(0)).toBe(false);
    expect(isValidAmount(-5)).toBe(false);
    expect(isValidAmount(12.5)).toBe(false);
    expect(isValidAmount(100000000)).toBe(false);
  });
});
