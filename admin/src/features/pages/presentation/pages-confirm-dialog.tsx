"use client";

import type { ReactNode } from "react";

import { Button, Dialog } from "@/shared/components/ui";

export function PagesConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = "إلغاء",
  destructive = false,
  loading = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean | undefined;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && !loading && onCancel()}
      title={title}
      dismissible={!loading}
      footer={
        <>
          <Button variant="secondary" disabled={loading} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}
