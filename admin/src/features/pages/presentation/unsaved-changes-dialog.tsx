"use client";

import { PagesConfirmDialog } from "./pages-confirm-dialog";

export function UnsavedChangesDialog({
  onStay,
  onDiscard,
}: {
  onStay: () => void;
  onDiscard: () => void;
}) {
  return (
    <PagesConfirmDialog
      open
      title="تغييرات غير محفوظة"
      cancelLabel="البقاء في المحرر"
      confirmLabel="تجاهل التغييرات والمغادرة"
      destructive
      onCancel={onStay}
      onConfirm={onDiscard}
    >
      <p>
        لديك تغييرات لم تُحفظ بعد. إذا غادرت الآن فستُفقد هذه التغييرات المحلية
        فقط.
      </p>
    </PagesConfirmDialog>
  );
}
