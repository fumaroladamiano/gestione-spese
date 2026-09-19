import type { ReactNode } from "react";
import styles from "./ListGroup.module.css";

type ListGroupProps = {
  title?: string;
  footer?: string;
  children: ReactNode;
};

/** Lista "inset grouped" stile Impostazioni di iOS. */
export function ListGroup({ title, footer, children }: ListGroupProps) {
  return (
    <section className={styles.group}>
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      <div className={styles.card}>{children}</div>
      {footer ? <p className={styles.footer}>{footer}</p> : null}
    </section>
  );
}
