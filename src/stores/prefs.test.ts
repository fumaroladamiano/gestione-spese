import { describe, expect, it } from "vitest";
import { DEFAULT_PREFS, sanitizePrefs } from "./prefs";

describe("sanitizePrefs", () => {
  it("usa i valori predefiniti se non c'è nulla di salvato", () => {
    expect(sanitizePrefs(undefined)).toEqual(DEFAULT_PREFS);
    expect(sanitizePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(sanitizePrefs("testo")).toEqual(DEFAULT_PREFS);
  });

  it("parte in italiano con tema automatico e carta", () => {
    expect(DEFAULT_PREFS.language).toBe("it");
    expect(DEFAULT_PREFS.theme).toBe("auto");
    expect(DEFAULT_PREFS.defaultPaymentMethod).toBe("carta");
  });

  it("mantiene i valori validi", () => {
    const saved = {
      theme: "dark",
      language: "en",
      defaultPaymentMethod: "contanti",
      lastBackupDate: "2026-09-16",
      installGuideSeen: true,
    };
    expect(sanitizePrefs(saved)).toEqual(saved);
  });

  it("riporta al predefinito solo i campi non validi", () => {
    expect(
      sanitizePrefs({
        theme: "blu",
        language: "fr",
        defaultPaymentMethod: "bonifico",
        lastBackupDate: "ieri",
        installGuideSeen: "sì",
      }),
    ).toEqual(DEFAULT_PREFS);
    expect(sanitizePrefs({ language: "en", theme: 3 })).toEqual({
      ...DEFAULT_PREFS,
      language: "en",
    });
  });
});
