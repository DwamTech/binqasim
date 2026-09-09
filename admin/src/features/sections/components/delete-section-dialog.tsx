"use client";

import { Button, Dialog } from "@/shared/components/ui";

import type { Section } from "../sections.contracts";
import { getSectionModuleLabel } from "../sections.contracts";
import { dashboardCopy } from "@/core/config/dashboard-copy";

export function DeleteSectionDialog({
  section,
  open,
  busy,
  error,
  onOpenChange,
  onConfirm,
}: {
  section: Section | null;
  open: boolean;
  busy: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  if (!section) return null;
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !busy && onOpenChange(next)}
      title={`تأكيد حذف ${dashboardCopy.modules.sections.singular}`}
      dismissible={!busy}
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
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            variant="danger"
            loading={busy}
            disabled={busy}
            onClick={onConfirm}
          >
            حذف {dashboardCopy.modules.sections.singular}
          </Button>
        </div>
      }
    >
      <p>
        سيتم حذف قسم <strong>{section.name}</strong> من موديول{" "}
        <strong>{getSectionModuleLabel(section.module)}</strong>.
      </p>
      <p>
        لا يمكن التراجع عن الحذف. إذا كان القسم مرتبطًا بمحتوى، سيمنع النظام
        العملية لحماية البيانات.
      </p>
      {error && (
        <p role="alert" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </Dialog>
  );
}
