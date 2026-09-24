import { TriangleAlert } from "lucide-react";
import { Link } from "react-router";
import { useToday } from "../../app/useToday";
import { daysBetween } from "../../domain/dates";
import { useT } from "../../i18n/useT";
import { usePrefs } from "../../stores/prefs";
import styles from "./BackupReminder.module.css";

/** Oltre questi giorni senza backup la Home lo ricorda (R1: rimuovere l'icona cancella i dati). */
const REMINDER_DAYS = 30;

type BackupReminderProps = {
  /** Si mostra solo se ci sono spese da salvare. */
  hasExpenses: boolean;
};

/** Promemoria in Home quando l'ultimo backup è vecchio o non è mai stato fatto. */
export function BackupReminder({ hasExpenses }: BackupReminderProps) {
  const t = useT();
  const lastBackup = usePrefs((state) => state.lastBackupDate);
  const today = useToday();
  const age = lastBackup === null ? null : daysBetween(lastBackup, today);
  if (!hasExpenses || (age !== null && age <= REMINDER_DAYS)) return null;

  return (
    <div className={styles.reminder} role="note">
      <TriangleAlert className={styles.icon} size={20} aria-hidden />
      <div className={styles.text}>
        <strong>{t("backupReminderTitle")}</strong>
        <span>
          {age === null
            ? t("backupReminderNever")
            : t("backupReminderDays", age)}
        </span>
      </div>
      <Link className={styles.action} to="/settings">
        {t("backupReminderAction")}
      </Link>
    </div>
  );
}
