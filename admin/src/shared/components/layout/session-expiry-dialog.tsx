"use client";

import { Button, Dialog } from "@/shared/components/ui";
import { formatRemainingSeconds } from "./session-expiry.helpers";

export type SessionExpiryDialogProps = {
  open: boolean;
  remainingSeconds: number;
  isExtending?: boolean;
  onExtend: () => void | Promise<void>;
  onLogout: () => void | Promise<void>;
  onClose?: () => void;
};

export function SessionExpiryDialog({
  open,
  remainingSeconds,
  isExtending = false,
  onExtend,
  onLogout,
  onClose,
}: SessionExpiryDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose?.();
      }}
      dismissible={Boolean(onClose)}
      title="ستنتهي جلستك قريبًا"
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-2)",
          }}
        >
          <Button variant="secondary" onClick={() => void onLogout()}>
            تسجيل الخروج
          </Button>
          <Button
            loading={isExtending}
            disabled={isExtending}
            onClick={() => void onExtend()}
          >
            تمديد الجلسة
          </Button>
        </div>
      }
    >
      <p>سيتم تسجيل خروجك خلال {formatRemainingSeconds(remainingSeconds)}.</p>
    </Dialog>
  );
}
