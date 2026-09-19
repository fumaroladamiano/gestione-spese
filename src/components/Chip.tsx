import { ChevronDown, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { classNames } from "./classNames";
import styles from "./Chip.module.css";

type ChipProps = {
  label: string;
  icon?: LucideIcon;
  /** Pallino colorato (es. colore della categoria nei filtri). */
  dot?: { light: string; dark: string };
  selected?: boolean;
  /** surface: pillola bianca (pieno tint se scelto) · soft: tenue (bordo tint se scelto). */
  variant?: "surface" | "soft";
  onClick: () => void;
  ariaLabel?: string;
  /** Freccia ▾: il chip apre un foglio di scelta. */
  caret?: boolean;
};

/** Pillola a un tocco per dettagli e filtri. */
export function Chip({
  label,
  icon: Icon,
  dot,
  selected = false,
  variant = "surface",
  onClick,
  ariaLabel,
  caret = false,
}: ChipProps) {
  const dotStyle: CSSProperties | undefined = dot
    ? { "--c-light": dot.light, "--c-dark": dot.dark }
    : undefined;
  return (
    <button
      type="button"
      className={classNames(
        styles.chip,
        variant === "soft" && styles.soft,
        selected && styles.selected,
      )}
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {Icon ? <Icon size={16} strokeWidth={2} aria-hidden /> : null}
      {dot ? <span className={styles.dot} style={dotStyle} /> : null}
      {label}
      {caret ? (
        <ChevronDown
          className={styles.caret}
          size={14}
          strokeWidth={2.6}
          aria-hidden
        />
      ) : null}
    </button>
  );
}
