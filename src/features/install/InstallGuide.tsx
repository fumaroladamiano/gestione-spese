import { SquarePlus, Share, TriangleAlert, Wallet } from "lucide-react";
import { Sheet } from "../../components/Sheet";
import { SheetHeader } from "../../components/SheetHeader";
import { useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import { useUi } from "../../stores/ui";
import styles from "./InstallGuide.module.css";

type InstallGuideProps = {
  /** Azione facoltativa sotto la guida (es. esportare un backup prima di installare). */
  extraAction?: { label: string; onClick: () => void };
};

/** Guida in 3 passaggi per aggiungere l'app alla Home da Safari (su iOS non c'è un pulsante "Installa"). */
export function InstallGuide({ extraAction }: InstallGuideProps) {
  const t = useT();
  const open = useUi((state) => state.installGuideOpen);
  const setOpen = useUi((state) => state.setInstallGuideOpen);
  const markSeen = usePrefs((state) => state.markInstallGuideSeen);

  const close = () => {
    markSeen();
    setOpen(false);
  };

  const steps = [
    { icon: Share, text: t("installStep1") },
    { icon: SquarePlus, text: t("installStep2") },
    { icon: null, text: t("installStep3") },
  ];

  return (
    <Sheet
      open={open}
      onRequestClose={close}
      label={t("installTitle")}
      header={
        <SheetHeader title="" cancelLabel={t("close")} onCancel={close} />
      }
      footer={
        <div className={styles.footer}>
          {extraAction ? (
            <button
              type="button"
              className={styles.secondary}
              onClick={extraAction.onClick}
            >
              {extraAction.label}
            </button>
          ) : null}
          <button type="button" className={styles.primary} onClick={close}>
            {t("gotIt")}
          </button>
        </div>
      }
    >
      <div className={styles.hero}>
        <span className={styles.appIcon}>
          <Wallet size={40} strokeWidth={2} aria-hidden />
        </span>
        <h2 className={styles.title}>{t("installTitle")}</h2>
        <p className={styles.intro}>{t("installIntro")}</p>
      </div>
      <ol className={styles.steps}>
        {steps.map((step, index) => (
          <li key={step.text} className={styles.step}>
            <span className={styles.number}>{index + 1}</span>
            <span className={styles.stepText}>{step.text}</span>
            {step.icon ? (
              <span className={styles.stepIcon}>
                <step.icon size={18} aria-hidden />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <p className={styles.warning}>
        <TriangleAlert className={styles.warningIcon} size={20} aria-hidden />
        <span>{t("installWarning")}</span>
      </p>
    </Sheet>
  );
}
