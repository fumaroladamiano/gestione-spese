import { Globe, Moon } from "lucide-react";
import { ListGroup } from "../../components/ListGroup";
import { Page } from "../../components/Page";
import { SegmentedControl } from "../../components/SegmentedControl";
import type { Language } from "../../i18n";
import { useT } from "../../i18n/useT";
import { usePrefs, type ThemePreference } from "../../stores/prefs";
import { SettingsRow } from "./SettingsRow";

export function SettingsPage() {
  const t = useT();
  const theme = usePrefs((state) => state.theme);
  const language = usePrefs((state) => state.language);
  const setTheme = usePrefs((state) => state.setTheme);
  const setLanguage = usePrefs((state) => state.setLanguage);

  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: "auto", label: t("themeAuto") },
    { value: "light", label: t("themeLight") },
    { value: "dark", label: t("themeDark") },
  ];
  // i nomi delle lingue restano nella propria lingua, come su iOS
  const languageOptions: { value: Language; label: string }[] = [
    { value: "it", label: t("languageItalian") },
    { value: "en", label: t("languageEnglish") },
  ];

  return (
    <Page title={t("settingsTitle")}>
      <ListGroup title={t("personalization")}>
        <SettingsRow
          icon={Moon}
          color="var(--color-system-gray)"
          label={t("appearance")}
        >
          <SegmentedControl
            label={t("appearance")}
            options={themeOptions}
            value={theme}
            onChange={setTheme}
          />
        </SettingsRow>
        <SettingsRow
          icon={Globe}
          color="var(--color-system-blue)"
          label={t("language")}
        >
          <SegmentedControl
            label={t("language")}
            options={languageOptions}
            value={language}
            onChange={setLanguage}
          />
        </SettingsRow>
      </ListGroup>
    </Page>
  );
}
