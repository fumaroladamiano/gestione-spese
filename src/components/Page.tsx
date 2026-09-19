import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import styles from "./Page.module.css";

type PageProps = {
  title: string;
  /** Riga sopra il large title (es. la data di oggi in Home). */
  caption?: string;
  /** Pulsante "‹" esplicito: nell'app installata non c'è il gesto per tornare indietro. */
  back?: { label: string; to: string; ariaLabel: string };
  /** Azione in alto a destra (es. "+" per una nuova categoria). */
  action?: ReactNode;
  children?: ReactNode;
};

/** Schermata con large title, aree sicure e spazio per la tab bar sospesa. */
export function Page({ title, caption, back, action, children }: PageProps) {
  return (
    <main className={styles.page}>
      {back || action ? (
        <div className={styles.nav}>
          {back ? (
            <Link
              className={styles.back}
              to={back.to}
              aria-label={back.ariaLabel}
            >
              <ChevronLeft size={26} strokeWidth={2.4} aria-hidden />
              {back.label}
            </Link>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      <header className={styles.header}>
        {caption ? <p className={styles.caption}>{caption}</p> : null}
        <h1 className={styles.title}>{title}</h1>
      </header>
      {children}
    </main>
  );
}
