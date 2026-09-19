import {
  AnimatePresence,
  motion,
  useDragControls,
  type PanInfo,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Sheet.module.css";

type SheetProps = {
  open: boolean;
  /** Richiesta di chiusura (Annulla, trascinamento, Esc): chi usa il foglio decide se confermare. */
  onRequestClose: () => void;
  /** Nome accessibile del foglio. */
  label: string;
  /** Barra in alto: Annulla · titolo · azione. Da qui parte il trascinamento. */
  header: ReactNode;
  children: ReactNode;
  /** Parte fissa in basso (es. tastierino o pulsante principale). */
  footer?: ReactNode;
};

const CLOSE_OFFSET = 120;
const CLOSE_VELOCITY = 600;

/** Foglio dal basso a tutta altezza: la schermata sotto si rimpicciolisce come su iOS. */
export function Sheet({
  open,
  onRequestClose,
  label,
  header,
  children,
  footer,
}: SheetProps) {
  const dragControls = useDragControls();
  // durante l'animazione di uscita il foglio resta a schermo con i gestori dell'ultimo render:
  // un tocco sullo sfondo in quel momento non deve chiedere di nuovo la chiusura
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  const requestClose = () => {
    if (openRef.current) onRequestClose();
  };

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.dataset.sheetOpen = "true";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onRequestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      delete root.dataset.sheetOpen;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onRequestClose]);

  const onDragEnd = (_event: PointerEvent, info: PanInfo) => {
    if (info.offset.y > CLOSE_OFFSET || info.velocity.y > CLOSE_VELOCITY) {
      requestClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="overlay"
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            onClick={requestClose}
          />
          <motion.div
            key="sheet"
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%", pointerEvents: "none" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={onDragEnd}
          >
            <div
              className={styles.handleArea}
              onPointerDown={(event) => {
                dragControls.start(event);
              }}
            >
              <div className={styles.grabber} />
              <div className={styles.header}>{header}</div>
            </div>
            <div className={styles.body}>{children}</div>
            {footer ? <div className={styles.footer}>{footer}</div> : null}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
