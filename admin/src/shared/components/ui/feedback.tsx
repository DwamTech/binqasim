import type { ReactNode } from "react";
import { Button, Skeleton, Spinner } from "./primitives";

export function Alert({
  title,
  children,
  variant = "info",
}: {
  title?: string;
  children: ReactNode;
  variant?: "info" | "error";
}) {
  return (
    <div
      className={`ui-alert ${variant === "error" ? "ui-alert--error" : ""}`}
      role={variant === "error" ? "alert" : "status"}
    >
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </div>
  );
}
export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="ui-state">
      <Spinner label={label} />
      <span>{label}</span>
    </div>
  );
}
export function PageSkeleton() {
  return (
    <div
      aria-label="Loading page"
      aria-busy="true"
      style={{ display: "grid", gap: "var(--space-4)" }}
    >
      <Skeleton style={{ inlineSize: "35%", blockSize: "2rem" }} />
      <Skeleton style={{ inlineSize: "100%", blockSize: "10rem" }} />
      <Skeleton style={{ inlineSize: "100%", blockSize: "10rem" }} />
    </div>
  );
}
export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section className="ui-state">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </section>
  );
}
export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <section className="ui-state" role="alert">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </section>
  );
}
export function InlineError({ children }: { children: ReactNode }) {
  return <Alert variant="error">{children}</Alert>;
}
