import { Page } from "../../components/Page";
import { PageNote } from "../../components/PageNote";
import { useT } from "../../i18n/useT";

export function ChartsPage() {
  const t = useT();
  return (
    <Page title={t("chartsTitle")}>
      <PageNote>{t("comingSoon")}</PageNote>
    </Page>
  );
}
