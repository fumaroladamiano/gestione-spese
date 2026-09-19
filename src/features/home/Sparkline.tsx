import type { CSSProperties } from "react";
import { classNames } from "../../components/classNames";
import styles from "./Sparkline.module.css";

type SparklineProps = {
  /** Totali in centesimi, il più vecchio per primo; l'ultimo è oggi. */
  values: number[];
  label: string;
};

/** Mini barre degli ultimi giorni, oggi evidenziato. */
export function Sparkline({ values, label }: SparklineProps) {
  const max = Math.max(...values, 1);
  return (
    <div className={styles.spark} role="img" aria-label={label}>
      {values.map((value, index) => {
        const style: CSSProperties = {
          height: `${String(Math.max(12, (value / max) * 100))}%`,
        };
        return (
          <i
            // posizione fissa: 7 barre dal più vecchio a oggi
            key={index}
            className={classNames(
              styles.bar,
              index === values.length - 1 && styles.today,
            )}
            style={style}
          />
        );
      })}
    </div>
  );
}
