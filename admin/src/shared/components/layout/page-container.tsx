import type { ReactNode } from "react";

import styles from "./page-container.module.css";

export function PageContainer({
  children,
  header,
}: {
  children: ReactNode;
  header?: ReactNode;
}) {
  return (
    <div className={styles.container}>
      {header && <div className={styles.header}>{header}</div>}
      {children}
    </div>
  );
}
