"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Dialog,
  ErrorState,
  Skeleton,
} from "@/shared/components/ui";
import {
  approveComment,
  deleteComment,
  getComment,
} from "../application/comments.client";
import {
  formatCommentDate,
  type ContentComment,
} from "../domain/comments.contracts";
import { resolveCommentTargetLabel } from "../domain/comment-target-labels";
import { CommentStatusBadge } from "./comment-status-badge";
import styles from "./comments.module.css";

export function CommentDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [item, setItem] = useState<ContentComment>();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<"approve" | "delete">();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void getComment(id, controller.signal)
      .then((result) => {
        if (!active) return;
        setItem(result);
        setError("");
      })
      .catch((reason: unknown) => {
        if (
          active &&
          !(reason instanceof DOMException && reason.name === "AbortError")
        ) {
          setError(
            reason instanceof Error ? reason.message : "تعذر تحميل التعليق.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, reloadKey]);

  async function approve() {
    if (!item || pending) return;
    const snapshot = item;
    setPending("approve");
    setError("");
    setNotice("");
    setItem({
      ...item,
      status: "approved",
      approved_at: new Date().toISOString(),
    });
    try {
      setItem(await approveComment(item.id));
      setNotice("تم اعتماد التعليق وأصبح ظاهرًا للعامة.");
      router.refresh();
    } catch (reason) {
      setItem(snapshot);
      setError(
        reason instanceof Error ? reason.message : "تعذر اعتماد التعليق.",
      );
    } finally {
      setPending(undefined);
    }
  }

  async function remove() {
    if (!item || pending) return;
    setPending("delete");
    setError("");
    try {
      await deleteComment(item.id);
      router.replace("/dashboard/comments");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حذف التعليق.");
      setConfirmDelete(false);
      setPending(undefined);
    }
  }

  if (loading) {
    return (
      <div className={styles.detailSkeleton} aria-busy="true">
        <Skeleton style={{ minBlockSize: "10rem" }} />
        <Skeleton style={{ minBlockSize: "24rem" }} />
      </div>
    );
  }

  if (!item) {
    return (
      <ErrorState
        title="تعذر عرض التعليق"
        description={error || "التعليق غير موجود أو تعذر تحميله."}
        onRetry={() => {
          setLoading(true);
          setReloadKey((value) => value + 1);
        }}
      />
    );
  }

  const targetLabel = resolveCommentTargetLabel(
    item.target.type,
    item.target.label,
  );

  return (
    <main className={styles.detailPage} dir="rtl">
      <div aria-live="polite" aria-atomic="true">
        {notice && <p className={styles.successNotice}>{notice}</p>}
        {error && (
          <p className={styles.errorNotice} role="alert">
            {error}
          </p>
        )}
      </div>

      <section className={styles.detailHero}>
        <span className={styles.detailMark} aria-hidden="true">
          ❞
        </span>
        <div>
          <span>تعليق من زائر</span>
          <h1>{item.target.title}</h1>
          <p>{targetLabel}</p>
        </div>
        <CommentStatusBadge status={item.status} />
      </section>

      <div className={styles.detailLayout}>
        <section className={styles.detailMain}>
          <Card className={styles.detailCard ?? ""}>
            <div className={styles.cardTitle}>
              <span>01</span>
              <div>
                <h2>نص التعليق</h2>
                <p>المحتوى الكامل كما كتبه الزائر دون اختصار.</p>
              </div>
            </div>
            <blockquote className={styles.fullComment}>{item.body}</blockquote>
          </Card>

          <Card className={styles.detailCard ?? ""}>
            <div className={styles.cardTitle}>
              <span>02</span>
              <div>
                <h2>المادة المصدر</h2>
                <p>العنصر الذي أُرسل التعليق من صفحته العامة.</p>
              </div>
            </div>
            <dl className={styles.detailsList}>
              <div>
                <dt>الموديول</dt>
                <dd>{targetLabel}</dd>
              </div>
              <div>
                <dt>عنوان المادة</dt>
                <dd>{item.target.title}</dd>
              </div>
              <div>
                <dt>المعرّف</dt>
                <dd dir="ltr">{item.target.locator}</dd>
              </div>
              <div>
                <dt>المسار العام</dt>
                <dd>
                  <code dir="ltr">{item.target.public_path ?? "—"}</code>
                </dd>
              </div>
            </dl>
          </Card>

          <Card className={styles.detailCard ?? ""}>
            <div className={styles.cardTitle}>
              <span>03</span>
              <div>
                <h2>سجل المراجعة</h2>
                <p>بيانات تقنية داخلية لا تظهر لزوار الموقع.</p>
              </div>
            </div>
            <dl className={styles.detailsList}>
              <div>
                <dt>عنوان IP</dt>
                <dd>
                  <code dir={item.ip_address ? "ltr" : "rtl"}>
                    {item.ip_address ?? "غير متاح"}
                  </code>
                </dd>
              </div>
              <div>
                <dt>تاريخ الإرسال</dt>
                <dd>
                  {formatCommentDate(item.created_at, item.created_at_label)}
                </dd>
              </div>
              <div>
                <dt>تاريخ الاعتماد</dt>
                <dd>{formatCommentDate(item.approved_at)}</dd>
              </div>
              <div>
                <dt>اعتمده</dt>
                <dd>{item.approver?.name ?? "لم يُعتمد بعد"}</dd>
              </div>
            </dl>
          </Card>
        </section>

        <aside>
          <Card className={styles.actionCard ?? ""}>
            <div className={styles.cardTitle}>
              <span>04</span>
              <div>
                <h2>قرار المراجعة</h2>
                <p>القبول ينشر التعليق، والحذف يزيله نهائيًا.</p>
              </div>
            </div>
            {item.status === "pending" ? (
              <Button
                loading={pending === "approve"}
                disabled={Boolean(pending)}
                onClick={() => void approve()}
              >
                قبول ونشر التعليق
              </Button>
            ) : (
              <p className={styles.approvedHint}>
                هذا التعليق معتمد ويظهر الآن للزوار باسم «زائر».
              </p>
            )}
            <Button
              variant="danger"
              disabled={Boolean(pending)}
              onClick={() => setConfirmDelete(true)}
            >
              حذف التعليق نهائيًا
            </Button>
          </Card>
        </aside>
      </div>

      <Link href="/dashboard/comments" className={styles.backLink}>
        العودة إلى إدارة التعليقات
      </Link>

      <Dialog
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!pending) setConfirmDelete(open);
        }}
        dismissible={!pending}
        title="حذف التعليق"
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={Boolean(pending)}
              onClick={() => setConfirmDelete(false)}
            >
              تراجع
            </Button>
            <Button
              variant="danger"
              loading={pending === "delete"}
              disabled={Boolean(pending)}
              onClick={() => void remove()}
            >
              تأكيد الحذف النهائي
            </Button>
          </div>
        }
      >
        <div className={styles.deleteDialog} dir="rtl">
          <span aria-hidden="true">!</span>
          <div>
            <p>سيُحذف هذا التعليق نهائيًا من قاعدة البيانات.</p>
            <strong>لا يمكن التراجع عن هذا الإجراء بعد تأكيده.</strong>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
