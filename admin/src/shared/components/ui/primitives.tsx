import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { forwardRef } from "react";

type ClassProps = { className?: string };
const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ClassProps & {
    variant?: "primary" | "secondary" | "danger";
    loading?: boolean;
  };
export function Button({
  children,
  className,
  variant = "primary",
  loading = false,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx("ui-button ui-focus", `ui-button--${variant}`, className)}
    >
      {loading && <Spinner label="Loading" />} {children}
    </button>
  );
}
export type IconButtonProps = Omit<ButtonProps, "children"> & {
  label: string;
  children: ReactNode;
};
export function IconButton({
  label,
  children,
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button
      {...props}
      className={cx("ui-icon-button", className)}
      aria-label={label}
    >
      {children}
    </Button>
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> &
  ClassProps & { error?: boolean };
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, "aria-invalid": ariaInvalid, ...props },
  ref,
) {
  return (
    <input
      {...props}
      ref={ref}
      aria-invalid={ariaInvalid ?? (error || undefined)}
      className={cx("ui-input ui-focus", className)}
    />
  );
});
export function Label({
  children,
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & ClassProps) {
  return (
    <label {...props} className={cx("ui-label", className)}>
      {children}
    </label>
  );
}
export function Checkbox({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & ClassProps) {
  return (
    <input
      {...props}
      type="checkbox"
      className={cx("ui-checkbox ui-focus", className)}
    />
  );
}
export function Card({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & ClassProps) {
  return (
    <div {...props} className={cx("ui-card", className)}>
      {children}
    </div>
  );
}
export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
} & ClassProps) {
  return (
    <span
      className={cx(
        "ui-badge",
        variant !== "default" && `ui-badge--${variant}`,
        className,
      )}
    >
      {children}
    </span>
  );
}
export function Spinner({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span className={cx("ui-spinner ui-spin", className)} role="status">
      <span className="sr-only">{label}</span>
    </span>
  );
}
export function Skeleton({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & ClassProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cx("ui-skeleton", className)}
      style={{ minBlockSize: "1rem", ...style }}
    />
  );
}
export { cx };
