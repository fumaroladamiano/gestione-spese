import { usePrefs } from "../stores/prefs";
import { applyTheme } from "./theme";

/**
 * Allinea la pagina alle preferenze: tema e attributo lang di <html>.
 * Si chiama prima del primo render, così non si vede il tema sbagliato all'avvio.
 */
export function syncDocumentWithPrefs(): () => void {
  const apply = () => {
    const { theme, language } = usePrefs.getState();
    applyTheme(theme);
    document.documentElement.lang = language;
  };
  apply();
  return usePrefs.subscribe(apply);
}
