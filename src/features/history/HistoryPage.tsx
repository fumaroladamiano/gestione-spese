import { Page } from "../../components/Page";
import { PageNote } from "../../components/PageNote";
import { useT } from "../../i18n/useT";

export function HistoryPage() {
  const t = useT();
  return (
    <Page title={t("historyTitle")}>
      <PageNote>{t("comingSoon")}</PageNote>
    </Page>
  );
}
