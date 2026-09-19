import { CreditCard, Globe, Moon, Tag } from "lucide-react";
import { useNavigate } from "react-router";
import { useCategories } from "../categories/useCategories";
import { ListGroup } from "../../components/ListGroup";
import { Page } from "../../components/Page";
import { SegmentedControl } from "../../components/SegmentedControl";
import { PAYMENT_METHODS, type PaymentMethod } from "../../domain/types";
import type { Language } from "../../i18n";
import { paymentMethodName } from "../../i18n/categoryNames";
import { useT } from "../../i18n/useT";
import { usePrefs, type ThemePreference } from "../../stores/prefs";
import { AppStatusSection } from "./AppStatusSection";
import { BackupSection } from "./BackupSection";
import { BudgetSection } from "./BudgetSection";
import { SettingsRow } from "./SettingsRow";

export function SettingsPage() {
  const t = useT();
  const navigate = useNavigate();
  const activeCount = (useCategories() ?? []).filter(
    (category) => !category.archived,
  ).length;
  const theme = usePrefs((state) => state.theme);
  const language = usePrefs((state) => state.language);
  const paymentMethod = usePrefs((state) => state.defaultPaymentMethod);
  const setTheme = usePrefs((state) => state.setTheme);
  const setLanguage = usePrefs((state) => state.setLanguage);
  const setPaymentMethod = usePrefs((state) => state.setDefaultPaymentMethod);

  const paymentOptions: { value: PaymentMethod; label: string }[] =
    PAYMENT_METHODS.map((method) => ({
      value: method,
      label: paymentMethodName(method, t),
    }));
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
      <BudgetSection />
      <ListGroup title={t("personalization")}>
        <SettingsRow
          icon={Tag}
          color="var(--color-system-orange)"
          label={t("categories")}
          value={String(activeCount)}
          onClick={() => void navigate("/settings/categories")}
        />
        <SettingsRow
          icon={CreditCard}
          color="var(--color-system-green)"
          label={t("defaultPaymentMethod")}
        >
          <SegmentedControl
            label={t("defaultPaymentMethod")}
            options={paymentOptions}
            value={paymentMethod}
            onChange={setPaymentMethod}
          />
        </SettingsRow>
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
      <BackupSection />
      <AppStatusSection />
    </Page>
  );
}
