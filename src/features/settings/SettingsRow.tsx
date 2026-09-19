import { ChevronRight, type LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { classNames } from "../../components/classNames";
import styles from "./SettingsRow.module.css";

type SettingsRowProps = {
  icon: LucideIcon;
  /** Variabile CSS del colore dell'icona, es. "var(--color-system-blue)". */
  color: string;
  label: string;
  /** Valore a destra (es. "Installata ✓"). */
  value?: string;
  /** Colore del valore: ok (verde) o warn (arancio), sempre insieme al testo. */
  tone?: "ok" | "warn";
  /** Se presente la riga è toccabile e mostra la freccia. */
  onClick?: () => void;
  /** Controllo mostrato sotto l'etichetta (es. un SegmentedControl). */
  children?: ReactNode;
};

/** Riga delle Impostazioni con icona su quadrato colorato stile iOS. */
export function SettingsRow({
  icon: Icon,
  color,
  label,
  value,
  tone,
  onClick,
  children,
}: SettingsRowProps) {
  const iconStyle: CSSProperties = { background: color };
  const head = (
    <>
      <span className={styles.icon} style={iconStyle}>
        <Icon size={18} strokeWidth={2} aria-hidden />
      </span>
      <span className={styles.label}>{label}</span>
      {value !== undefined ? (
        <span
          className={classNames(
            styles.value,
            tone === "ok" && styles.ok,
            tone === "warn" && styles.warn,
          )}
        >
          {value}
        </span>
      ) : null}
      {onClick ? (
        <ChevronRight
          className={styles.chevron}
          size={18}
          strokeWidth={2.4}
          aria-hidden
        />
      ) : null}
    </>
  );

  return (
    <div className={styles.row}>
      {onClick ? (
        <button
          type="button"
          className={classNames(styles.head, styles.button)}
          onClick={onClick}
        >
          {head}
        </button>
      ) : (
        <div className={styles.head}>{head}</div>
      )}
      {children ? <div className={styles.control}>{children}</div> : null}
    </div>
  );
}
