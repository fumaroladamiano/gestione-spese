import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isPaymentMethod, type PaymentMethod } from "../domain/types";
import { DEFAULT_LANGUAGE, isLanguage, type Language } from "../i18n";

export const THEME_PREFERENCES = ["auto", "light", "dark"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.some((theme) => theme === value);
}

/** Preferenze del dispositivo: non fanno parte del backup (proposta § 3.1). */
export type PrefsData = {
  theme: ThemePreference;
  language: Language;
  defaultPaymentMethod: PaymentMethod;
  /** Data (YYYY-MM-DD) dell'ultimo backup esportato, null se mai fatto. */
  lastBackupDate: string | null;
  installGuideSeen: boolean;
};

type PrefsActions = {
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: Language) => void;
  setDefaultPaymentMethod: (method: PaymentMethod) => void;
  setLastBackupDate: (date: string) => void;
  markInstallGuideSeen: () => void;
};

export const DEFAULT_PREFS: PrefsData = {
  theme: "auto",
  language: DEFAULT_LANGUAGE,
  defaultPaymentMethod: "carta",
  lastBackupDate: null,
  installGuideSeen: false,
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Legge le preferenze salvate scartando i valori non validi (es. lingua modificata a mano
 * o formato di una versione precedente): ogni campo sbagliato torna al valore predefinito.
 */
export function sanitizePrefs(saved: unknown): PrefsData {
  if (typeof saved !== "object" || saved === null) return { ...DEFAULT_PREFS };
  const value = new Map<string, unknown>(Object.entries(saved));
  const theme = value.get("theme");
  const language = value.get("language");
  const method = value.get("defaultPaymentMethod");
  const backup = value.get("lastBackupDate");
  const guide = value.get("installGuideSeen");
  return {
    theme: isThemePreference(theme) ? theme : DEFAULT_PREFS.theme,
    language: isLanguage(language) ? language : DEFAULT_PREFS.language,
    defaultPaymentMethod: isPaymentMethod(method)
      ? method
      : DEFAULT_PREFS.defaultPaymentMethod,
    lastBackupDate:
      typeof backup === "string" && DATE.test(backup) ? backup : null,
    installGuideSeen: guide === true,
  };
}

export const usePrefs = create<PrefsData & PrefsActions>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFS,
      setTheme: (theme) => {
        set({ theme });
      },
      setLanguage: (language) => {
        set({ language });
      },
      setDefaultPaymentMethod: (defaultPaymentMethod) => {
        set({ defaultPaymentMethod });
      },
      setLastBackupDate: (lastBackupDate) => {
        set({ lastBackupDate });
      },
      markInstallGuideSeen: () => {
        set({ installGuideSeen: true });
      },
    }),
    {
      name: "spese:prefs",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({
        theme,
        language,
        defaultPaymentMethod,
        lastBackupDate,
        installGuideSeen,
      }) => ({
        theme,
        language,
        defaultPaymentMethod,
        lastBackupDate,
        installGuideSeen,
      }),
      merge: (saved, current) => ({ ...current, ...sanitizePrefs(saved) }),
    },
  ),
);
