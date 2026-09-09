"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  focusElement,
  getNextMenuItemIndex,
  getToggledDropdownState,
  isPointerOutsideDropdown,
  shouldCloseDropdownForKey,
} from "./dropdown-menu.helpers";
import { Button, cx } from "./primitives";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  footer,
  dismissible = true,
  size = "default",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  dismissible?: boolean;
  size?: "default" | "wide";
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const dialog = dialogRef.current;
    const firstFocusable =
      dialog?.querySelector<HTMLElement>(focusableSelector);
    (firstFocusable ?? dialog)?.focus();

    return () => previousFocusRef.current?.focus();
  }, [open]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && dismissible) {
      event.stopPropagation();
      onOpenChange(false);
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    );
    if (focusable.length === 0) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;
  return (
    <div
      className="ui-dialog-backdrop"
      role="presentation"
      onMouseDown={dismissible ? () => onOpenChange(false) : undefined}
    >
      <section
        className={`ui-dialog ui-dialog--${size} ui-fade-in`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="ui-dialog-header">
          <h2 id={titleId}>{title}</h2>
          {dismissible && (
            <Button
              variant="secondary"
              className="ui-dialog-close"
              onClick={() => onOpenChange(false)}
              aria-label="Close dialog"
            >
              ×
            </Button>
          )}
        </div>
        <div className="ui-dialog-body">{children}</div>
        {footer && <div className="ui-dialog-footer">{footer}</div>}
      </section>
    </div>
  );
}
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  children,
  confirmLabel = "Confirm",
  onConfirm,
  destructive = false,
  confirmLoading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
  confirmLoading?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-2)",
          }}
        >
          <Button
            variant="secondary"
            disabled={confirmLoading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            loading={confirmLoading}
            disabled={confirmLoading}
          >
            {confirmLoading ? "جارٍ الحذف..." : confirmLabel}
          </Button>
        </div>
      }
    >
      {children}
    </Dialog>
  );
}
export function DropdownMenu({
  trigger,
  children,
  direction = "down",
}: {
  trigger: ReactNode;
  children: ReactNode;
  direction?: "down" | "up";
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    focusElement(
      menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]') ?? null,
    );
    return () => focusElement(previousFocusRef.current);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        isPointerOutsideDropdown(target, triggerRef.current, menuRef.current)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  const closeMenu = () => setOpen(false);
  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (shouldCloseDropdownForKey(event.key)) {
      event.preventDefault();
      closeMenu();
      return;
    }

    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    const activeIndex = items.findIndex(
      (item) => item === document.activeElement,
    );
    const nextIndex = getNextMenuItemIndex(
      activeIndex < 0 ? 0 : activeIndex,
      items.length,
      event.key,
    );
    if (nextIndex !== null) {
      event.preventDefault();
      items[nextIndex]?.focus();
    }
  };

  return (
    <div className={`ui-menu${direction === "up" ? " ui-menu--up" : ""}`}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className="ui-button ui-button--secondary ui-focus"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(getToggledDropdownState)}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          className="ui-menu-content"
          role="menu"
          aria-labelledby={triggerId}
          onKeyDown={handleMenuKeyDown}
          onClick={(event) => {
            if (
              event.target instanceof Element &&
              event.target.closest('[role="menuitem"]')
            ) {
              closeMenu();
            }
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
export function DropdownMenuItem({
  children,
  onSelect,
  className,
}: {
  children: ReactNode;
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cx("ui-menu-item ui-focus", className)}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}
export function Tooltip({
  content,
  children,
}: {
  content: string;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="ui-tooltip"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="ui-tooltip-content" role="tooltip">
          {content}
        </span>
      )}
    </span>
  );
}
