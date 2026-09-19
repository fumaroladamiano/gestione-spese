import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { classNames } from "./classNames";
import styles from "./ActionSheet.module.css";

export type SheetAction = {
  label: string;
  destructive?: boolean;
  onSelect: () => void;
};

type ActionSheetProps = {
  open: boolean;
  title: string;
  message?: string;
  actions: SheetAction[];
  cancelLabel: string;
  onCancel: () => void;
};

/** Elenco di azioni stile iOS con "Annulla" separato: conferme e scelte multiple. */
export function ActionSheet({
  open,
  title,
  message,
  actions,
  cancelLabel,
  onCancel,
}: ActionSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="overlay"
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            key="sheet"
            className={styles.container}
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ type: "spring", damping: 34, stiffness: 380 }}
          >
            <div className={styles.card}>
              <div className={styles.heading}>
                <p className={styles.title}>{title}</p>
                {message ? <p className={styles.message}>{message}</p> : null}
              </div>
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className={classNames(
                    styles.button,
                    action.destructive && styles.destructive,
                  )}
                  onClick={action.onSelect}
                >
                  {action.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={classNames(styles.button, styles.cancel)}
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
