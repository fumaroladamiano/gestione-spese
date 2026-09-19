import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AmountText } from "../../components/AmountText";
import styles from "./StatTile.module.css";

type StatTileProps = {
  icon: LucideIcon;
  label: string;
  cents: number;
  /** Sottotitolo sotto l'importo (es. "2 spese"). */
  sub?: string;
  /** Contenuto sopra l'importo (es. mini barre). */
  children?: ReactNode;
};

/** Riquadro della Home: icona su fondo tenue, etichetta, importo. */
export function StatTile({
  icon: Icon,
  label,
  cents,
  sub,
  children,
}: StatTileProps) {
  return (
    <div className={styles.tile}>
      <div className={styles.top}>
        <span className={styles.icon}>
          <Icon size={15} strokeWidth={2.2} aria-hidden />
        </span>
        <span className={styles.label}>{label}</span>
      </div>
      {children}
      <AmountText cents={cents} className={styles.amount} />
      {sub ? <span className={styles.sub}>{sub}</span> : null}
    </div>
  );
}
