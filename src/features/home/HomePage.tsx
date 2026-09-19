import { Page } from "../../components/Page";
import { PageNote } from "../../components/PageNote";
import { useT } from "../../i18n/useT";

export function HomePage() {
  const t = useT();
  return (
    <Page title={t("homeTitle")}>
      <PageNote>{t("comingSoon")}</PageNote>
    </Page>
  );
}
