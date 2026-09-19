import styles from "./PageNote.module.css";

type PageNoteProps = { children: string };

/** Testo secondario sotto il titolo, per le schermate non ancora complete. */
export function PageNote({ children }: PageNoteProps) {
  return <p className={styles.note}>{children}</p>;
}
