import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import styles from "./SectionHeader.module.css";

type SectionHeaderProps = {
  title: string;
  /** Link a destra (es. "Vedi tutte ›"). */
  link?: { label: string; to: string };
};

/** Titolo di sezione (Section Title) con link facoltativo. */
export function SectionHeader({ title, link }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {link ? (
        <Link className={styles.link} to={link.to}>
          {link.label}
          <ChevronRight size={16} strokeWidth={2.4} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
