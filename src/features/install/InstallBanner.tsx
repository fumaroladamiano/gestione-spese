import { Download, X } from "lucide-react";
import { useT } from "../../i18n/useT";
import { useUi } from "../../stores/ui";
import styles from "./InstallBanner.module.css";
import { useStandalone } from "./useStandalone";

/** Invito all'installazione in Home, solo se l'app è aperta in Safari. */
export function InstallBanner() {
  const t = useT();
  const standalone = useStandalone();
  const dismissed = useUi((state) => state.installBannerDismissed);
  const dismiss = useUi((state) => state.dismissInstallBanner);
  const openGuide = useUi((state) => state.setInstallGuideOpen);

  if (standalone || dismissed) return null;

  return (
    <div className={styles.banner}>
      <button
        type="button"
        className={styles.main}
        onClick={() => {
          openGuide(true);
        }}
      >
        <span className={styles.icon}>
          <Download size={22} aria-hidden />
        </span>
        <span className={styles.texts}>
          <span className={styles.title}>{t("installBannerTitle")}</span>
          <span className={styles.subtitle}>{t("installBannerSubtitle")}</span>
        </span>
      </button>
      <button
        type="button"
        className={styles.close}
        aria-label={t("close")}
        onClick={dismiss}
      >
        <X size={14} strokeWidth={2.6} aria-hidden />
      </button>
    </div>
  );
}
