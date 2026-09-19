import { describe, expect, it } from "vitest";
import { createT, localeOf, resolveLanguage } from "./index";

describe("resolveLanguage", () => {
  it("usa l'italiano se la lingua manca", () => {
    expect(resolveLanguage(undefined)).toBe("it");
    expect(resolveLanguage(null)).toBe("it");
  });

  it("usa l'italiano se la lingua non è supportata", () => {
    expect(resolveLanguage("fr")).toBe("it");
    expect(resolveLanguage(42)).toBe("it");
  });

  it("mantiene le lingue supportate", () => {
    expect(resolveLanguage("it")).toBe("it");
    expect(resolveLanguage("en")).toBe("en");
  });
});

describe("localeOf", () => {
  it("usa it-IT per l'italiano ed en-IE per l'inglese", () => {
    expect(localeOf("it")).toBe("it-IT");
    expect(localeOf("en")).toBe("en-IE");
  });
});

describe("createT", () => {
  it("restituisce i testi nella lingua scelta", () => {
    expect(createT("it")("tabHistory")).toBe("Storico");
    expect(createT("en")("tabHistory")).toBe("History");
  });

  it("lascia il nome dell'app invariato in entrambe le lingue", () => {
    expect(createT("it")("appName")).toBe("Spese");
    expect(createT("en")("appName")).toBe("Spese");
  });

  it("gestisce singolare e plurale in italiano", () => {
    const t = createT("it");
    expect(t("nExpenses", 1)).toBe("1 spesa");
    expect(t("nExpenses", 2)).toBe("2 spese");
    expect(t("nExpenses", 0)).toBe("0 spese");
  });

  it("gestisce singolare e plurale in inglese", () => {
    const t = createT("en");
    expect(t("nExpenses", 1)).toBe("1 expense");
    expect(t("nExpenses", 2)).toBe("2 expenses");
  });
});
