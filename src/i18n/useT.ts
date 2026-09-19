import { useMemo } from "react";
import { usePrefs } from "../stores/prefs";
import { createT, localeOf, type Locale, type Translate } from "./index";

/** t() nella lingua attiva: i componenti si aggiornano appena cambia la lingua. */
export function useT(): Translate {
  const language = usePrefs((state) => state.language);
  return useMemo(() => createT(language), [language]);
}

/** Locale della lingua attiva (it-IT / en-IE) per gli helper di formattazione. */
export function useLocale(): Locale {
  return localeOf(usePrefs((state) => state.language));
}
