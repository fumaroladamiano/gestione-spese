import type { CSSProperties, ReactNode } from "react";
import { classNames } from "../../components/classNames";
import styles from "./DonutChart.module.css";

export type DonutSlice = {
  id: string;
  totalCents: number;
  colorLight: string;
  colorDark: string;
};

type DonutChartProps = {
  slices: DonutSlice[];
  selected: string | null;
  onSelect: (id: string) => void;
  /** Contenuto al centro (totale o categoria scelta). */
  children: ReactNode;
};

const SIZE = 212;
const RADIUS = 78;
const STROKE = 22;
const GAP = 5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Ciambella per categoria: spicchi con estremi arrotondati e piccolo stacco,
 * quello scelto più spesso e gli altri attenuati. La legenda accanto è la parte accessibile.
 */
export function DonutChart({
  slices,
  selected,
  onSelect,
  children,
}: DonutChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.totalCents, 0);
  const multiple = slices.length > 1;
  let offset = 0;

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${String(SIZE)} ${String(SIZE)}`}
        aria-hidden
      >
        <circle
          className={styles.track}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
        />
        <g transform={`rotate(-90 ${String(SIZE / 2)} ${String(SIZE / 2)})`}>
          {total > 0
            ? slices.map((slice) => {
                const length = (slice.totalCents / total) * CIRCUMFERENCE;
                const isSelected = slice.id === selected;
                const dimmed = selected !== null && !isSelected;
                const width = isSelected
                  ? STROKE + 8
                  : dimmed
                    ? STROKE - 6
                    : STROKE;
                // con gli estremi arrotondati la lunghezza visibile è il tratto più lo spessore
                const dash = multiple
                  ? Math.max(0.01, length - GAP - width)
                  : CIRCUMFERENCE;
                const start = offset + (multiple ? width / 2 + GAP / 2 : 0);
                offset += length;
                const style: CSSProperties = {
                  "--c-light": slice.colorLight,
                  "--c-dark": slice.colorDark,
                };
                return (
                  <circle
                    key={slice.id}
                    className={classNames(
                      styles.slice,
                      dimmed && styles.dimmed,
                    )}
                    style={style}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    strokeWidth={width}
                    strokeLinecap={multiple ? "round" : "butt"}
                    strokeDasharray={`${String(dash)} ${String(CIRCUMFERENCE - dash)}`}
                    strokeDashoffset={-start}
                    onClick={() => {
                      onSelect(slice.id);
                    }}
                  />
                );
              })
            : null}
        </g>
      </svg>
      <div className={styles.center}>{children}</div>
    </div>
  );
}
