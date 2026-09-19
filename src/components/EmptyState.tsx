import type { LucideIcon } from "lucide-react";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
};

/** Stato vuoto: icona su squircle tenue, titolo, messaggio e azione facoltativa. */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <span className={styles.icon}>
        <Icon size={34} strokeWidth={1.8} aria-hidden />
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {action ? (
        <button
          type="button"
          className={styles.action}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
