import { Database, HardDrive, Info, RefreshCw, Smartphone } from "lucide-react";
import { ListGroup } from "../../components/ListGroup";
import { formatKilobytes } from "../../domain/money";
import type { TextKey } from "../../i18n";
import { useLocale, useT } from "../../i18n/useT";
import { useUi } from "../../stores/ui";
import { useStandalone } from "../install/useStandalone";
import { SettingsRow } from "./SettingsRow";
import { useCheckUpdates } from "./useCheckUpdates";
import { useStorageStatus, type PersistState } from "./useStorageStatus";

const PERSIST_TEXT: Record<PersistState, TextKey> = {
  checking: "persistChecking",
  on: "persistOn",
  off: "persistOff",
  unsupported: "persistUnsupported",
};

/** Stato dell'app web: installazione, archiviazione persistente, spazio, versione. */
export function AppStatusSection() {
  const t = useT();
  const locale = useLocale();
  const standalone = useStandalone();
  const storage = useStorageStatus();
  const openGuide = useUi((state) => state.setInstallGuideOpen);
  const checkUpdates = useCheckUpdates();

  return (
    <ListGroup title={t("appSection")} footer={t("appFooter")}>
      {standalone ? (
        <SettingsRow
          icon={Smartphone}
          color="var(--color-system-green)"
          label={t("status")}
          value={t("installed")}
          tone="ok"
        />
      ) : (
        <SettingsRow
          icon={Smartphone}
          color="var(--color-system-orange)"
          label={t("status")}
          value={t("openInSafari")}
          tone="warn"
          onClick={() => {
            openGuide(true);
          }}
        />
      )}
      <SettingsRow
        icon={Database}
        color="var(--color-system-blue)"
        label={t("persistentStorage")}
        value={t(PERSIST_TEXT[storage.persist])}
        tone={
          storage.persist === "on"
            ? "ok"
            : storage.persist === "off"
              ? "warn"
              : undefined
        }
      />
      {storage.usageBytes !== null ? (
        <SettingsRow
          icon={HardDrive}
          color="var(--color-system-gray)"
          label={t("storageUsed")}
          value={formatKilobytes(storage.usageBytes, locale)}
        />
      ) : null}
      <SettingsRow
        icon={Info}
        color="var(--color-system-indigo)"
        label={t("version")}
        value={__APP_VERSION__}
      />
      <SettingsRow
        icon={RefreshCw}
        color="var(--color-system-teal)"
        label={t("checkUpdates")}
        onClick={() => void checkUpdates()}
      />
    </ListGroup>
  );
}
