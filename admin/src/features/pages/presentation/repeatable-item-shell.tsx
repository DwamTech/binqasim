"use client";

import { useState, type ReactNode } from "react";

import { Button, IconButton } from "@/shared/components/ui";

import { PagesIcon } from "./pages-icons";
import styles from "./pages.module.css";

export function RepeatableItemShell({
  label,
  index,
  summary,
  children,
  canMoveUp,
  canMoveDown,
  disabled,
  defaultExpanded = false,
  removeLabel,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  label: string;
  index: number;
  summary: string;
  children: ReactNode;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled: boolean;
  defaultExpanded?: boolean;
  removeLabel: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <article className={styles.itemCard}>
      <header className={styles.itemHeader}>
        <div className={styles.itemIdentity}>
          <div>
            <h4>
              {label} {index + 1}
            </h4>
            <p className={styles.itemSummary}>{summary || "عنصر جديد"}</p>
          </div>
        </div>
        <div className={styles.itemActions}>
          <IconButton
            label={`نقل ${label} للأعلى`}
            variant="secondary"
            disabled={disabled || !canMoveUp}
            onClick={onMoveUp}
          >
            <PagesIcon name="up" />
          </IconButton>
          <IconButton
            label={`نقل ${label} للأسفل`}
            variant="secondary"
            disabled={disabled || !canMoveDown}
            onClick={onMoveDown}
          >
            <PagesIcon name="down" />
          </IconButton>
          <Button variant="danger" disabled={disabled} onClick={onRemove}>
            <PagesIcon name="trash" />
            {removeLabel}
          </Button>
          <IconButton
            label={expanded ? `طي ${label}` : `توسيع ${label}`}
            variant="secondary"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            <PagesIcon name={expanded ? "up" : "down"} />
          </IconButton>
        </div>
      </header>
      {expanded && <div className={styles.itemBody}>{children}</div>}
    </article>
  );
}
