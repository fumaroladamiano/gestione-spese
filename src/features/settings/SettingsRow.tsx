import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import styles from "./SettingsRow.module.css";

type SettingsRowProps = {
  icon: LucideIcon;
  /** Variabile CSS del colore dell'icona, es. "var(--color-system-blue)". */
  color: string;
  label: string;
  /** Controllo mostrato sotto l'etichetta (es. un SegmentedControl). */
  children?: ReactNode;
};

/** Riga delle Impostazioni con icona su quadrato colorato stile iOS. */
export function SettingsRow({
  icon: Icon,
  color,
  label,
  children,
}: SettingsRowProps) {
  const iconStyle: CSSProperties = { background: color };
  return (
    <div className={styles.row}>
      <div className={styles.head}>
        <span className={styles.icon} style={iconStyle}>
          <Icon size={18} strokeWidth={2} aria-hidden />
        </span>
        <span className={styles.label}>{label}</span>
      </div>
      {children ? <div className={styles.control}>{children}</div> : null}
    </div>
  );
}
