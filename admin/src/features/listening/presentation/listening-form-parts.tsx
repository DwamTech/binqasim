import type { ReactNode } from "react";

import styles from "./listening.module.css";

export function ListeningSectionTitle({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.sectionTitle}>
      <span>{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function ListeningField({
  label,
  error,
  hint,
  wide,
  children,
}: {
  label: string;
  error?: string[] | undefined;
  hint?: string | undefined;
  wide?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <label className={wide ? styles.wideField : undefined}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
      {error?.[0] && <em role="alert">{error[0]}</em>}
    </label>
  );
}
