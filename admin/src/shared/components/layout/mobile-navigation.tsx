"use client";

import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";

import type { NavigationItem } from "./admin-shell";
import { AdminSidebar } from "./admin-sidebar";
import {
  focusDrawerAndRestoreTrigger,
  getFocusTrapDestination,
  lockBodyScroll,
} from "./mobile-navigation.helpers";
import styles from "./mobile-navigation.module.css";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function MobileNavigation({
  open,
  navigation,
  onLogout,
  onOpenChange,
  triggerRef,
}: {
  open: boolean;
  navigation: NavigationItem[];
  onLogout: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    return focusDrawerAndRestoreTrigger(drawerRef.current, trigger);
  }, [open, triggerRef]);

  useEffect(() => {
    if (!open) return;
    return lockBodyScroll(document.body.style);
  }, [open]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onOpenChange(false);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    );
    if (focusable.length === 0) {
      event.preventDefault();
      drawerRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    const destination = getFocusTrapDestination({
      key: event.key,
      shiftKey: event.shiftKey,
      activeElement: document.activeElement,
      first,
      last,
    });
    if (destination === "last") {
      event.preventDefault();
      last.focus();
    } else if (destination === "first") {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;
  return (
    <div className={styles.backdrop} onMouseDown={() => onOpenChange(false)}>
      <div
        ref={drawerRef}
        id="admin-mobile-navigation"
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="التنقل"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className={`${styles.closeButton} ui-focus`}
          onClick={() => onOpenChange(false)}
          aria-label="إغلاق التنقل"
        >
          ×
        </button>
        <AdminSidebar
          mobile
          navigation={navigation}
          collapsed={false}
          onCollapsedChange={() => undefined}
          onLogout={onLogout}
          onNavigate={() => onOpenChange(false)}
        />
      </div>
    </div>
  );
}
