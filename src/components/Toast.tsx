import { X } from "lucide-react";
import styles from "./Toast.module.css";

type ToastProps = {
  message: string;
  /** Azione facoltativa (es. "Aggiorna", "Annulla"). */
  actionLabel?: string;
  onAction?: () => void;
  /** Se presente mostra la ✕ per chiudere il messaggio. */
  closeLabel?: string;
  onClose?: () => void;
};

/** Messaggio non bloccante sopra la tab bar. */
export function Toast({
  message,
  actionLabel,
  onAction,
  closeLabel,
  onClose,
}: ToastProps) {
  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.message}>{message}</span>
      {actionLabel && onAction ? (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
      {closeLabel && onClose ? (
        <button
          type="button"
          className={styles.close}
          aria-label={closeLabel}
          onClick={onClose}
        >
          <X size={16} strokeWidth={2.6} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
