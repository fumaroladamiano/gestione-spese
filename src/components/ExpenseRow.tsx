import { Pencil, Repeat, Trash2 } from "lucide-react";
import { m, type PanInfo } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Category } from "../domain/types";
import { AmountText } from "./AmountText";
import { CategoryIcon } from "./CategoryIcon";
import styles from "./ExpenseRow.module.css";

const ACTIONS_WIDTH = 156;
/** Oltre questa distanza lo swipe lungo elimina direttamente. */
const FULL_SWIPE = ACTIONS_WIDTH + 70;
/** Spostamento massimo del dito perché valga come tocco. */
const TAP_TOLERANCE = 8;

type ExpenseRowProps = {
  category: Pick<Category, "icon" | "colorLight" | "colorDark">;
  title: string;
  subtitle: string;
  amountCents: number;
  recurring: boolean;
  /** Frase completa per VoiceOver (importo, categoria, nota, giorno, metodo). */
  ariaLabel: string;
  labels: { edit: string; delete: string; recurring: string };
  onEdit: () => void;
  onDelete: () => void;
};

/** Riga spesa: tocco = modifica, swipe a sinistra = Modifica / Elimina, swipe lungo = elimina. */
export function ExpenseRow({
  category,
  title,
  subtitle,
  amountCents,
  recurring,
  ariaLabel,
  labels,
  onEdit,
  onDelete,
}: ExpenseRowProps) {
  const [open, setOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  // dopo uno swipe il rilascio del dito non deve contare anche come tocco (modifica):
  // il click nativo arriva comunque, quindi si misura quanto si è spostato il dito
  const pressStart = useRef({ x: 0, y: 0 });
  const moved = useRef(false);

  const settle = (nextOpen: boolean) => {
    setOpen(nextOpen);
  };

  // un tocco fuori dalla riga aperta la richiude
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        rowRef.current?.contains(event.target)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open]);

  const onDragEnd = (_event: PointerEvent, info: PanInfo) => {
    // posizione finale: punto di partenza (aperta o chiusa) più lo spostamento del dito
    const position = (open ? -ACTIONS_WIDTH : 0) + info.offset.x;
    if (position < -FULL_SWIPE) {
      settle(false);
      onDelete();
    } else {
      settle(position < -ACTIONS_WIDTH / 2 || info.velocity.x < -500);
    }
  };

  return (
    <div ref={rowRef} className={styles.row}>
      <div className={styles.actions} aria-hidden={!open}>
        <button
          type="button"
          className={styles.edit}
          tabIndex={open ? 0 : -1}
          onClick={() => {
            settle(false);
            onEdit();
          }}
        >
          <Pencil size={20} aria-hidden />
          {labels.edit}
        </button>
        <button
          type="button"
          className={styles.delete}
          tabIndex={open ? 0 : -1}
          onClick={() => {
            settle(false);
            onDelete();
          }}
        >
          <Trash2 size={20} aria-hidden />
          {labels.delete}
        </button>
      </div>
      <m.button
        type="button"
        className={styles.content}
        animate={{ x: open ? -ACTIONS_WIDTH : 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -FULL_SWIPE - 40, right: 0 }}
        dragElastic={{ left: 0.2, right: 0.05 }}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        onPointerDown={(event) => {
          pressStart.current = { x: event.clientX, y: event.clientY };
          moved.current = false;
        }}
        onPointerUp={(event) => {
          moved.current =
            Math.hypot(
              event.clientX - pressStart.current.x,
              event.clientY - pressStart.current.y,
            ) > TAP_TOLERANCE;
        }}
        onClick={() => {
          if (moved.current) return;
          if (open) settle(false);
          else onEdit();
        }}
        aria-label={ariaLabel}
      >
        <CategoryIcon category={category} size={40} />
        <span className={styles.main}>
          <span className={styles.title}>
            <span className={styles.titleText}>{title}</span>
            {recurring ? (
              <Repeat
                className={styles.recurring}
                size={13}
                strokeWidth={2.4}
                aria-label={labels.recurring}
              />
            ) : null}
          </span>
          <span className={styles.subtitle}>{subtitle}</span>
        </span>
        <AmountText cents={amountCents} className={styles.amount} />
      </m.button>
    </div>
  );
}
