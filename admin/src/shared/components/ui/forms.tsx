"use client";

import {
  cloneElement,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
  type KeyboardEvent,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { Button, Input, Label, cx } from "./primitives";

export type SelectOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export type SelectProps = {
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  name?: string;
  id?: string;
  placeholder?: ReactNode;
  disabled?: boolean;
  className?: string;
  autoSubmit?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
};

export function Select({
  value,
  options,
  onValueChange,
  name,
  id,
  placeholder = "اختر من القائمة",
  disabled = false,
  className,
  autoSubmit = false,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: SelectProps) {
  const router = useContext(AppRouterContext);
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const listboxId = `${controlId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [listboxStyle, setListboxStyle] = useState<CSSProperties>();
  const [, startNavigationTransition] = useTransition();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const firstEnabledIndex = options.findIndex((option) => !option.disabled);
  const [activeIndex, setActiveIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : firstEnabledIndex,
  );
  const selectedOption = options[selectedIndex];

  const updateListboxPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 8;
    const gap = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(rect.width, viewportWidth - viewportPadding * 2);
    const left = Math.min(
      Math.max(rect.left, viewportPadding),
      viewportWidth - width - viewportPadding,
    );
    const measuredHeight = listboxRef.current?.offsetHeight;
    const estimatedHeight = Math.min(288, options.length * 48 + 16);
    const desiredHeight = measuredHeight || estimatedHeight;
    const spaceBelow = viewportHeight - rect.bottom - gap - viewportPadding;
    const spaceAbove = rect.top - gap - viewportPadding;
    const openAbove =
      spaceBelow < Math.min(desiredHeight, 160) && spaceAbove > spaceBelow;
    const availableHeight = Math.max(
      120,
      Math.min(288, openAbove ? spaceAbove : spaceBelow),
    );

    setListboxStyle({
      inset: "auto",
      top: openAbove ? "auto" : rect.bottom + gap,
      right: "auto",
      bottom: openAbove ? viewportHeight - rect.top + gap : "auto",
      left,
      width,
      maxHeight: availableHeight,
    });
  }, [options.length]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target) &&
        !listboxRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    updateListboxPosition();
    window.addEventListener("resize", updateListboxPosition);
    window.addEventListener("scroll", updateListboxPosition, true);
    return () => {
      window.removeEventListener("resize", updateListboxPosition);
      window.removeEventListener("scroll", updateListboxPosition, true);
    };
  }, [open, updateListboxPosition]);

  const openListbox = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex);
    updateListboxPosition();
    setOpen(true);
  };

  const moveActiveOption = (direction: 1 | -1) => {
    if (options.length === 0) return;
    let next = activeIndex;
    for (let count = 0; count < options.length; count += 1) {
      next = (next + direction + options.length) % options.length;
      if (!options[next]?.disabled) {
        setActiveIndex(next);
        return;
      }
    }
  };

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    if (option.value === value) {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (hiddenInputRef.current) hiddenInputRef.current.value = option.value;
    onValueChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
    if (autoSubmit) {
      const form = rootRef.current?.closest("form");
      if (!form) return;
      const target = new URL(form.action, window.location.href);
      const params = new URLSearchParams();
      for (const [fieldName, fieldValue] of new FormData(form)) {
        if (typeof fieldValue === "string" && fieldValue !== "")
          params.append(fieldName, fieldValue);
      }
      const query = params.toString();
      const destination = query
        ? `${target.pathname}?${query}`
        : target.pathname;
      startNavigationTransition(() => {
        if (router) {
          router.replace(destination, { scroll: false });
          return;
        }
        window.history.replaceState(null, "", destination);
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openListbox();
        return;
      }
      moveActiveOption(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(firstEnabledIndex);
      return;
    }
    if (event.key === "End" && open) {
      event.preventDefault();
      const lastEnabledIndex = options.findLastIndex(
        (option) => !option.disabled,
      );
      setActiveIndex(lastEnabledIndex);
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      selectOption(activeIndex);
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cx("ui-select", open && "ui-select--open", className)}
    >
      {name && (
        <input ref={hiddenInputRef} type="hidden" name={name} value={value} />
      )}
      <button
        ref={triggerRef}
        id={controlId}
        type="button"
        className="ui-select-trigger ui-focus"
        disabled={disabled}
        role="combobox"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={
          open && activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        onClick={() => {
          if (open) setOpen(false);
          else openListbox();
        }}
        onKeyDown={handleKeyDown}
      >
        <span className={selectedOption ? undefined : "ui-select-placeholder"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <svg
          className="ui-select-chevron"
          viewBox="0 0 20 20"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={listboxRef}
            id={listboxId}
            className="ui-select-listbox ui-select-listbox--portal"
            role="listbox"
            aria-label={ariaLabel}
            style={listboxStyle}
          >
            {options.map((option, index) => (
              <button
                key={option.value}
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                className={cx(
                  "ui-select-option",
                  index === activeIndex && "ui-select-option--active",
                )}
                aria-selected={option.value === value}
                disabled={option.disabled}
                onPointerMove={() => !option.disabled && setActiveIndex(index)}
                onClick={() => selectOption(index)}
              >
                <span
                  className="ui-select-option__indicator"
                  aria-hidden="true"
                >
                  {option.value === value ? "✓" : ""}
                </span>
                <span className="ui-select-option__content">
                  <strong>{option.label}</strong>
                  {option.description && <small>{option.description}</small>}
                </span>
              </button>
            ))}
          </div>,
          document.getElementById("admin-floating-overlays") ?? document.body,
        )}
    </div>
  );
}

export const PasswordInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function PasswordInput({ className, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="ui-password-input">
      <Input
        {...props}
        ref={ref}
        className={cx(className)}
        type={visible ? "text" : "password"}
        style={{ ...props.style }}
      />
      <Button
        variant="secondary"
        type="button"
        className="ui-password-toggle"
        aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? "إخفاء" : "إظهار"}
      </Button>
    </div>
  );
});

export function FormMessage({
  children,
  error = false,
  className,
  id,
}: {
  children?: ReactNode;
  error?: boolean;
  className?: string;
  id?: string;
}) {
  if (!children) return null;
  return (
    <p
      className={cx(
        "ui-form-message",
        error && "ui-form-message--error",
        className,
      )}
      id={id}
      role={error ? "alert" : undefined}
    >
      {children}
    </p>
  );
}

type FieldControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
};

export function FormField({
  label,
  children,
  description,
  message,
  error = false,
  id,
}: {
  label: ReactNode;
  children: ReactElement<FieldControlProps>;
  description?: ReactNode;
  message?: ReactNode;
  error?: boolean;
  id?: string;
}) {
  const generatedId = useId();
  const descriptionId = useId();
  const messageId = useId();
  const fieldId = children.props.id ?? id ?? generatedId;
  const describedBy = [
    children.props["aria-describedby"],
    description ? descriptionId : undefined,
    message ? messageId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const controlProps: FieldControlProps = {
    id: fieldId,
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
    ...(error
      ? { "aria-invalid": true }
      : children.props["aria-invalid"] !== undefined
        ? { "aria-invalid": children.props["aria-invalid"] }
        : {}),
  };
  const control = cloneElement(children, controlProps);

  return (
    <div className="ui-form-field">
      <Label htmlFor={fieldId}>{label}</Label>
      {control}
      {description && (
        <FormMessage id={descriptionId}>{description}</FormMessage>
      )}
      {message && (
        <FormMessage id={messageId} error={error}>
          {message}
        </FormMessage>
      )}
    </div>
  );
}
