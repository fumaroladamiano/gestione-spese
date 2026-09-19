import styles from "./Toggle.module.css";

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** Interruttore stile iOS con etichetta a sinistra. */
export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={styles.row}
      onClick={() => {
        onChange(!checked);
      }}
    >
      <span>{label}</span>
      <span className={styles.track} aria-hidden />
    </button>
  );
}
