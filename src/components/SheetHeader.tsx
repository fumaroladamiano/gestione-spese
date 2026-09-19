import { classNames } from "./classNames";
import styles from "./SheetHeader.module.css";

type SheetHeaderProps = {
  title: string;
  cancelLabel: string;
  onCancel: () => void;
  /** Azione principale a destra (es. "Salva"); disattivata finché i dati non sono validi. */
  actionLabel?: string;
  actionEnabled?: boolean;
  onAction?: () => void;
};

/** Barra dei fogli: Annulla · titolo · azione principale a pillola. */
export function SheetHeader({
  title,
  cancelLabel,
  onCancel,
  actionLabel,
  actionEnabled = true,
  onAction,
}: SheetHeaderProps) {
  return (
    <>
      <button type="button" className={styles.cancel} onClick={onCancel}>
        {cancelLabel}
      </button>
      <h2 className={styles.title}>{title}</h2>
      {actionLabel && onAction ? (
        <button
          type="button"
          className={classNames(
            styles.action,
            !actionEnabled && styles.disabled,
          )}
          aria-disabled={!actionEnabled}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : (
        <span />
      )}
    </>
  );
}
