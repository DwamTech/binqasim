import type { ReactNode } from "react";

import { cx } from "./primitives";

export function FilterPanel({
  title,
  description,
  children,
  className,
  "aria-label": ariaLabel,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <section
      className={cx("ui-filter-panel", className)}
      aria-label={ariaLabel ?? title}
    >
      <div className="ui-filter-panel__intro">
        <span className="ui-filter-panel__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M4 5h16l-6.3 7.1v5.3l-3.4 1.6v-6.9L4 5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="ui-filter-panel__body">{children}</div>
    </section>
  );
}
