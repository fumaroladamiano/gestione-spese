import type { Dictionary, Translate } from "./dictionary";
import { en } from "./en";
import { it } from "./it";

export type { Translate, TextKey } from "./dictionary";

export const LANGUAGES = ["it", "en"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "it";

const DICTIONARIES: Record<Language, Dictionary> = { it, en };
const LOCALES = { it: "it-IT", en: "en-IE" } as const;
export type Locale = (typeof LOCALES)[Language];

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((language) => language === value);
}

/** Lingua mancante o non valida → italiano (nessun rilevamento dal dispositivo). */
export function resolveLanguage(value: unknown): Language {
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}

/** Locale usato per importi e date: it → it-IT, en → en-IE. */
export function localeOf(language: Language): Locale {
  return LOCALES[language];
}

/** Crea la funzione t() per una lingua: t("addExpense"), t("nExpenses", 3). */
export function createT(language: Language): Translate {
  const dictionary = DICTIONARIES[language];
  return (key, ...args) => {
    const entry: unknown = dictionary[key];
    // Reflect.apply evita di forzare il tipo: i parametri sono già verificati da TextArgs<K>
    return typeof entry === "function"
      ? String(Reflect.apply(entry, undefined, args))
      : String(entry);
  };
}
