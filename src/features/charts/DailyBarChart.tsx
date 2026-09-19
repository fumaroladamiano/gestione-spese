import { classNames } from "../../components/classNames";
import styles from "./DailyBarChart.module.css";

type DailyBarChartProps = {
  /** Totale di ogni giorno (indice 0 = giorno 1). */
  values: number[];
  /** Giorno di oggi se il mese è quello corrente (i successivi sono futuri). */
  todayDay: number | null;
  /** Media giornaliera in centesimi; 0 = nessuna linea. */
  averageCents: number;
  averageLabel: string;
  selectedDay: number | null;
  onSelect: (day: number) => void;
  /** Etichetta accessibile di ogni barra (giorno e importo). */
  barLabel: (day: number, cents: number) => string;
};

const WIDTH = 330;
const HEIGHT = 156;
const TOP = 16;
const BOTTOM = 22;
const AXIS_DAYS = [1, 8, 15, 22, 29];

/** Barre giornaliere del mese: oggi evidenziato, media tratteggiata, giorni futuri vuoti. */
export function DailyBarChart({
  values,
  todayDay,
  averageCents,
  averageLabel,
  selectedDay,
  onSelect,
  barLabel,
}: DailyBarChartProps) {
  const slot = WIDTH / values.length;
  const barWidth = Math.max(3, slot * 0.64);
  const max = Math.max(...values, 1);
  const chartHeight = HEIGHT - TOP - BOTTOM;
  const baseline = HEIGHT - BOTTOM;
  const averageY = baseline - (averageCents / max) * chartHeight;

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${String(WIDTH)} ${String(HEIGHT)}`}
    >
      <defs>
        <linearGradient id="dailyBarGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles.gradientTop} />
          <stop offset="1" className={styles.gradientBottom} />
        </linearGradient>
      </defs>
      {values.map((cents, index) => {
        const day = index + 1;
        const x = index * slot + (slot - barWidth) / 2;
        const future = todayDay !== null && day > todayDay;
        if (future) {
          return (
            <circle
              key={day}
              className={styles.future}
              cx={x + barWidth / 2}
              cy={baseline - 2}
              r={1.4}
            />
          );
        }
        const height = cents > 0 ? Math.max(4, (cents / max) * chartHeight) : 2;
        const highlighted =
          selectedDay === null ? day === todayDay : day === selectedDay;
        return (
          <g key={day}>
            <rect
              className={classNames(
                styles.bar,
                cents === 0 && styles.empty,
                highlighted && styles.highlighted,
                selectedDay !== null && !highlighted && styles.muted,
              )}
              x={x}
              y={baseline - height}
              width={barWidth}
              height={height}
              rx={Math.min(4, barWidth / 2)}
            />
            {/* area di tocco su tutta l'altezza, raggiungibile anche da tastiera e VoiceOver */}
            <rect
              className={styles.hit}
              x={index * slot}
              y={0}
              width={slot}
              height={HEIGHT}
              role="button"
              tabIndex={0}
              aria-label={barLabel(day, cents)}
              aria-pressed={selectedDay === day}
              onClick={() => {
                onSelect(day);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(day);
                }
              }}
            />
          </g>
        );
      })}
      {averageCents > 0 ? (
        <g className={styles.average} aria-hidden>
          <line x1={0} x2={WIDTH} y1={averageY} y2={averageY} />
          <text x={WIDTH} y={averageY - 5} textAnchor="end">
            {averageLabel}
          </text>
        </g>
      ) : null}
      {AXIS_DAYS.filter((day) => day <= values.length).map((day) => (
        <text
          key={day}
          className={styles.axis}
          x={(day - 1) * slot + slot / 2}
          y={HEIGHT - 5}
          textAnchor="middle"
          aria-hidden
        >
          {day}
        </text>
      ))}
    </svg>
  );
}
