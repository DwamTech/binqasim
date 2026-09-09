"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import {
  Alert,
  Button,
  Card,
  ErrorState,
  Skeleton,
} from "@/shared/components/ui";
import { getFeedback, updateFeedbackStatus } from "../feedback.client";
import {
  feedbackStatuses,
  feedbackStatusLabels,
  feedbackTypeLabels,
  formatFeedbackDate,
  type FeedbackItem,
  type FeedbackStatus,
} from "../feedback.contracts";
import { FeedbackStatusBadge } from "./feedback-status-badge";
import styles from "./feedback.module.css";

export function FeedbackDetailView({ id }: { id: string }) {
  const [item, setItem] = useState<FeedbackItem>();
  const [status, setStatus] = useState<FeedbackStatus>("new");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void getFeedback(id, controller.signal)
      .then((result) => {
        if (!active) return;
        setItem(result);
        setStatus(result.status);
        setNote(result.admin_note ?? "");
        setError("");
      })
      .catch((reason: unknown) => {
        if (
          active &&
          !(reason instanceof DOMException && reason.name === "AbortError")
        )
          setError(
            reason instanceof Error ? reason.message : "تعذر تحميل الطلب.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, reloadKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await updateFeedbackStatus(id, status, note.trim());
      setItem(updated);
      setStatus(updated.status);
      setNote(updated.admin_note ?? "");
      setNotice("تم تحديث حالة الطلب وملاحظة الإدارة بنجاح.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تحديث الطلب.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className={styles.detailSkeleton} aria-busy="true">
        <Skeleton style={{ minBlockSize: "12rem" }} />
        <Skeleton style={{ minBlockSize: "20rem" }} />
      </div>
    );

  if (!item)
    return (
      <ErrorState
        title="تعذر عرض الطلب"
        description={error || "الطلب غير موجود أو تعذر تحميله."}
        onRetry={() => {
          setLoading(true);
          setReloadKey((value) => value + 1);
        }}
      />
    );

  return (
    <main className={styles.detailPage} dir="rtl">
      {notice && (
        <p className={styles.successNotice} role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className={styles.errorNotice} role="alert">
          {error}
        </p>
      )}

      <section className={styles.detailHero}>
        <div className={styles.requestMark} aria-hidden="true">
          {item.type === "complaint" ? "!" : "✦"}
        </div>
        <div>
          <span>{feedbackTypeLabels[item.type]}</span>
          <h1>{item.category ?? "طلب بدون تصنيف"}</h1>
          <code>{item.request_number}</code>
        </div>
        <FeedbackStatusBadge status={item.status} />
      </section>

      <div className={styles.detailLayout}>
        <section className={styles.detailMain}>
          <Card className={styles.detailCard ?? ""}>
            <div className={styles.cardTitle}>
              <span>01</span>
              <div>
                <h2>نص الطلب</h2>
                <p>المحتوى الكامل كما أرسله المستفيد.</p>
              </div>
            </div>
            <p className={styles.fullMessage}>
              {item.message ?? "لا توجد رسالة مسجلة."}
            </p>
          </Card>

          <Card className={styles.detailCard ?? ""}>
            <div className={styles.cardTitle}>
              <span>02</span>
              <div>
                <h2>بيانات مقدم الطلب</h2>
                <p>بيانات التواصل المرتبطة بهذا الطلب.</p>
              </div>
            </div>
            <dl className={styles.detailsList}>
              <div>
                <dt>الاسم</dt>
                <dd>{item.name ?? "غير مسجل"}</dd>
              </div>
              <div>
                <dt>البريد الإلكتروني</dt>
                <dd dir="ltr">{item.email ?? "—"}</dd>
              </div>
              <div>
                <dt>رقم الهاتف</dt>
                <dd dir="ltr">{item.phone ?? "—"}</dd>
              </div>
              <div>
                <dt>التصنيف</dt>
                <dd>{item.category ?? "بدون تصنيف"}</dd>
              </div>
            </dl>
          </Card>

          <Card className={styles.detailCard ?? ""}>
            <div className={styles.cardTitle}>
              <span>03</span>
              <div>
                <h2>السجل الإداري</h2>
                <p>تواريخ الاستلام والمراجعة وآخر مسؤول.</p>
              </div>
            </div>
            <dl className={styles.detailsList}>
              <div>
                <dt>تاريخ الاستلام</dt>
                <dd>{formatFeedbackDate(item.created_at)}</dd>
              </div>
              <div>
                <dt>آخر تحديث</dt>
                <dd>{formatFeedbackDate(item.updated_at)}</dd>
              </div>
              <div>
                <dt>تاريخ المراجعة</dt>
                <dd>{formatFeedbackDate(item.reviewed_at)}</dd>
              </div>
              <div>
                <dt>تمت المراجعة بواسطة</dt>
                <dd>{item.reviewer?.name ?? "لم تتم المراجعة بعد"}</dd>
              </div>
            </dl>
          </Card>
        </section>

        <aside>
          <Card className={styles.statusCard ?? ""}>
            <div className={styles.cardTitle}>
              <span>04</span>
              <div>
                <h2>إدارة الحالة</h2>
                <p>اختر الحالة وسجّل ملاحظة داخلية.</p>
              </div>
            </div>
            <form onSubmit={(event) => void submit(event)}>
              <label>
                <span>حالة الطلب</span>
                <select
                  className="ui-input"
                  value={status}
                  disabled={saving}
                  onChange={(event) =>
                    setStatus(event.target.value as FeedbackStatus)
                  }
                >
                  {feedbackStatuses.map((value) => (
                    <option key={value} value={value}>
                      {feedbackStatusLabels[value]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>ملاحظة الإدارة</span>
                <textarea
                  className="ui-textarea"
                  rows={8}
                  value={note}
                  disabled={saving}
                  placeholder="دوّن الإجراء المتخذ أو سبب تغيير الحالة..."
                  onChange={(event) => setNote(event.target.value)}
                />
                <small>ملاحظة داخلية لا تظهر في القائمة العامة.</small>
              </label>
              <Button type="submit" loading={saving} disabled={saving}>
                حفظ الحالة والملاحظة
              </Button>
            </form>
            {item.status === "rejected" && !item.admin_note && (
              <Alert title="ملاحظة">
                يُفضّل تسجيل سبب الرفض لتسهيل المتابعة الداخلية.
              </Alert>
            )}
          </Card>
        </aside>
      </div>

      <Link
        href={`/dashboard/feedback?type=${item.type}`}
        className={styles.backLink}
      >
        العودة إلى {feedbackTypeLabels[item.type]}
      </Link>
    </main>
  );
}
