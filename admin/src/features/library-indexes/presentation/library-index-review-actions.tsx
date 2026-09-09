"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Dialog } from "@/shared/components/ui";
import {
  approveLibraryIndexSubmission,
  rejectLibraryIndexSubmission,
} from "../application/library-indexes.client";
import type { LibraryIndexSubmission } from "../domain/library-indexes.contracts";
import styles from "./library-indexes.module.css";

type ReviewAction = "approve" | "reject";

export function LibraryIndexReviewActions({
  item,
  onReviewed,
  compact = false,
}: {
  item: LibraryIndexSubmission;
  onReviewed?: (item: LibraryIndexSubmission) => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const [action, setAction] = useState<ReviewAction>();
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (item.status !== "pending") return null;

  function closeDialog() {
    if (pending) return;
    setAction(undefined);
    setReason("");
    setError("");
  }

  async function confirm() {
    if (!action || pending) return;
    const trimmedReason = reason.trim();
    if (action === "reject" && trimmedReason.length < 3) {
      setError("اكتب سبب رفض واضحًا من 3 أحرف على الأقل.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const updated =
        action === "approve"
          ? await approveLibraryIndexSubmission(item.type, item.id)
          : await rejectLibraryIndexSubmission(
              item.type,
              item.id,
              trimmedReason,
            );
      onReviewed?.(updated);
      setAction(undefined);
      setReason("");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر مراجعة الطلب.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className={compact ? styles.compactActions : styles.reviewActions}>
        <Button onClick={() => setAction("approve")}>قبول</Button>
        <Button variant="danger" onClick={() => setAction("reject")}>
          رفض
        </Button>
      </div>
      <Dialog
        open={action !== undefined}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        dismissible={!pending}
        title={action === "approve" ? "اعتماد الطلب" : "رفض الطلب"}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={closeDialog}
            >
              تراجع
            </Button>
            <Button
              variant={action === "reject" ? "danger" : "primary"}
              loading={pending}
              disabled={pending}
              onClick={() => void confirm()}
            >
              {action === "approve" ? "تأكيد القبول" : "تأكيد الرفض"}
            </Button>
          </div>
        }
      >
        <div className={styles.dialogBody} dir="rtl">
          <p>
            {action === "approve"
              ? "سيظهر هذا السجل مباشرة في الجدول العام بالموقع بعد الاعتماد."
              : "لن يظهر الطلب في الجدول العام، وسيُحفظ سبب الرفض للمراجعة الداخلية."}
          </p>
          {action === "reject" && (
            <label>
              <span>سبب الرفض</span>
              <textarea
                className="ui-textarea"
                rows={5}
                maxLength={1000}
                disabled={pending}
                value={reason}
                placeholder="مثال: الصورة غير واضحة أو البيانات غير مكتملة..."
                onChange={(event) => setReason(event.target.value)}
              />
              <small>{reason.trim().length} / 1000</small>
            </label>
          )}
          {error && (
            <p className={styles.actionError} role="alert">
              {error}
            </p>
          )}
        </div>
      </Dialog>
    </>
  );
}
