import type { ReactNode } from "react";
import styles from "./Page.module.css";

type PageProps = {
  title: string;
  /** Riga sopra il large title (es. la data di oggi in Home). */
  caption?: string;
  children?: ReactNode;
};

/** Schermata principale con large title, aree sicure e spazio per la tab bar sospesa. */
export function Page({ title, caption, children }: PageProps) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        {caption ? <p className={styles.caption}>{caption}</p> : null}
        <h1 className={styles.title}>{title}</h1>
      </header>
      {children}
    </main>
  );
}
