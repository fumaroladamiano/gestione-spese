import { useT } from "../i18n/useT";

// Pagina provvisoria: diventa il layout con la tab bar nello step 0.4
export function App() {
  const t = useT();
  return <h1>{t("appName")}</h1>;
}
