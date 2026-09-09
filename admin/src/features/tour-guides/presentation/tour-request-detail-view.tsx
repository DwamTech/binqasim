"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageContainer } from "@/shared/components/layout/page-container";
import {
  Alert,
  Button,
  Dialog,
  ErrorState,
  HeroSection,
  Select,
  Skeleton,
} from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import {
  getTourRequest,
  updateTourRequestStatus,
} from "../application/tour-guides.client";
import {
  formatPreferredSchedule,
  formatTourDate,
  tourRequestStatuses,
  tourRequestStatusLabels,
  tourVisitorTypeLabels,
  type TourRequest,
  type TourRequestStatus,
} from "../domain/tour-guides.contracts";
import styles from "./tour-guides.module.css";
import { TourRequestStatusBadge } from "./tour-request-status-badge";

export function TourRequestDetailView({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [request, setRequest] = useState<TourRequest>();
  const [status, setStatus] = useState<TourRequestStatus>("new");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const result = await getTourRequest(requestId, controller.signal);
        if (!active) return;
        setRequest(result);
        setStatus(result.status);
        setNote(result.admin_note ?? "");
        setError("");
      } catch (reason) {
        if (active)
          setError(
            reason instanceof Error ? reason.message : "تعذر تحميل الطلب.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey, requestId]);

  async function confirmStatusUpdate() {
    if (!request || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const updated = await updateTourRequestStatus(request.id, status, note);
      setRequest(updated);
      setStatus(updated.status);
      setNote(updated.admin_note ?? "");
      setConfirmOpen(false);
      setNotice("تم تحديث حالة الطلب وحفظ ملاحظة الإدارة.");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تحديث الحالة.");
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <PageContainer>
        <div className={styles.detailSkeletons}>
          <Skeleton style={{ minBlockSize: "12rem" }} />
          <Skeleton style={{ minBlockSize: "30rem" }} />
        </div>
      </PageContainer>
    );
  if (error && !request)
    return (
      <PageContainer>
        <ErrorState
          title="تعذر تحميل طلب الرحلة"
          description={error}
          onRetry={() => setReloadKey((value) => value + 1)}
        />
      </PageContainer>
    );
  if (!request) return null;

  const changed =
    status !== request.status ||
    note.trim() !== (request.admin_note ?? "").trim();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة طلبات الرحلات"
          title={`الطلب ${request.reference}`}
          description={`أُرسل بواسطة ${request.full_name} في ${formatTourDate(request.created_at)}`}
          leading={
            <span className={styles.requestHeroMark} aria-hidden="true">
              ✦
            </span>
          }
          actions={
            <Link
              className="ui-button ui-button--secondary ui-focus"
              href="/dashboard/tour-guides/requests"
            >
              العودة إلى الطلبات
            </Link>
          }
        />
      }
    >
      <main className={styles.page}>
        {notice && (
          <p className={styles.successNotice} role="status">
            {notice}
          </p>
        )}
        {error && (
          <Alert variant="error" title="تعذر تنفيذ العملية">
            {error}
          </Alert>
        )}
        <section className={styles.requestDetailGrid}>
          <div className={styles.requestDetailMain}>
            <article
              className={`${styles.detailCard} ${styles.requestSummaryCard}`}
            >
              <header>
                <div>
                  <small>ملخص الطلب</small>
                  <h2>{request.tour_route}</h2>
                </div>
                <TourRequestStatusBadge status={request.status} />
              </header>
              <dl className={styles.metadataGrid}>
                <Meta label="المرشد المطلوب" value={request.guide.name} />
                <Meta
                  label="موعد الرحلة"
                  value={formatPreferredSchedule(request)}
                />
                <Meta
                  label="عدد المشاركين"
                  value={formatArabicNumber(request.participants_count)}
                />
                <Meta
                  label="نوع الزائر"
                  value={
                    tourVisitorTypeLabels[request.visitor_type] ??
                    request.visitor_type
                  }
                />
              </dl>
              <div className={styles.longText}>
                <span>الهدف من الجولة</span>
                <p>{request.tour_goal}</p>
              </div>
            </article>

            <article className={styles.detailCard}>
              <header>
                <div>
                  <small>بيانات التواصل</small>
                  <h2>الزائر مقدم الطلب</h2>
                </div>
              </header>
              <dl className={styles.metadataGrid}>
                <Meta label="الاسم الكامل" value={request.full_name} />
                <Meta label="رقم الجوال" value={request.phone} ltr />
                <Meta label="البريد الإلكتروني" value={request.email} ltr />
                <Meta label="رقم الطلب" value={request.reference} ltr />
                <Meta
                  label="الموافقة على الخصوصية"
                  value={formatTourDate(request.privacy_accepted_at)}
                />
              </dl>
              <div className={styles.contactActions}>
                <a
                  className="ui-button ui-button--secondary ui-focus"
                  href={`tel:${request.phone}`}
                >
                  اتصال
                </a>
                <a
                  className="ui-button ui-button--secondary ui-focus"
                  href={`mailto:${request.email}`}
                >
                  إرسال بريد
                </a>
              </div>
            </article>

            <article className={styles.detailCard}>
              <header>
                <div>
                  <small>مسؤول الجولة</small>
                  <h2>{request.guide.name}</h2>
                </div>
                {request.guide.is_archived && (
                  <span
                    className={`${styles.visibilityBadge} ${styles.inactive}`}
                  >
                    مرشد مؤرشف
                  </span>
                )}
              </header>
              <p className={styles.guideBio}>{request.guide.title}</p>
              <div className={styles.contactActions}>
                {request.guide.is_archived ? (
                  <span className={styles.archivedHint}>
                    أُرشف ملف المرشد، وتظل بيانات هذا الطلب محفوظة.
                  </span>
                ) : (
                  <Link
                    className="ui-button ui-button--secondary ui-focus"
                    href={`/dashboard/tour-guides/guides/${request.guide.id}`}
                  >
                    فتح ملف المرشد
                  </Link>
                )}
                {request.guide.phone && (
                  <a
                    className="ui-button ui-button--secondary ui-focus"
                    href={`tel:${request.guide.phone}`}
                  >
                    التواصل مع المرشد
                  </a>
                )}
              </div>
            </article>

            <article className={`${styles.detailCard} ${styles.historyCard}`}>
              <header>
                <div>
                  <small>الأثر التشغيلي</small>
                  <h2>سجل حالات الطلب</h2>
                </div>
              </header>
              {request.status_history.length ? (
                <ol className={styles.timeline}>
                  {request.status_history.map((entry) => (
                    <li key={entry.id}>
                      <span aria-hidden="true" />
                      <div>
                        <header>
                          <strong>
                            {entry.toStatus
                              ? tourRequestStatusLabels[entry.toStatus]
                              : "تحديث الطلب"}
                          </strong>
                          <time>{formatTourDate(entry.createdAt)}</time>
                        </header>
                        {entry.fromStatus && entry.toStatus && (
                          <small>
                            من {tourRequestStatusLabels[entry.fromStatus]} إلى{" "}
                            {tourRequestStatusLabels[entry.toStatus]}
                          </small>
                        )}
                        {entry.actor && (
                          <small>بواسطة {entry.actor.name}</small>
                        )}
                        {entry.note && <p>{entry.note}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.muted}>
                  لم تُسجّل تغييرات على حالة الطلب بعد.
                </p>
              )}
            </article>
          </div>

          <aside className={`${styles.detailCard} ${styles.statusPanel}`}>
            <small>إدارة الطلب</small>
            <h2>تحديث الحالة</h2>
            <p>اختر المرحلة الحالية وأضف ملاحظة داخلية تحفظ ضمن سجل الطلب.</p>
            <label>
              <span>الحالة الحالية</span>
              <Select
                value={status}
                options={tourRequestStatuses.map((item) => ({
                  value: item,
                  label: tourRequestStatusLabels[item],
                }))}
                onValueChange={(value) => setStatus(value as TourRequestStatus)}
              />
            </label>
            <label>
              <span>ملاحظة الإدارة</span>
              <textarea
                className="ui-textarea ui-focus"
                rows={7}
                maxLength={5000}
                value={note}
                placeholder="مثال: تم التواصل مع المرشد وتأكيد الموعد..."
                onChange={(event) => setNote(event.target.value)}
              />
              <small>{formatArabicNumber(note.length)} / ٥٬٠٠٠</small>
            </label>
            <Button disabled={!changed} onClick={() => setConfirmOpen(true)}>
              حفظ تحديث الطلب
            </Button>
            {!changed && <small>لا توجد تغييرات غير محفوظة.</small>}
            <div className={styles.statusGuide}>
              <span>مسار العمل</span>
              <ol>
                <li
                  className={
                    request.status === "new" ? styles.current : undefined
                  }
                >
                  جديد
                </li>
                <li
                  className={
                    request.status === "in_progress"
                      ? styles.current
                      : undefined
                  }
                >
                  قيد التنفيذ
                </li>
                <li
                  className={
                    request.status === "completed" ? styles.current : undefined
                  }
                >
                  منتهي
                </li>
              </ol>
            </div>
          </aside>
        </section>

        <Dialog
          open={confirmOpen}
          onOpenChange={(open) => !submitting && setConfirmOpen(open)}
          title="تأكيد تحديث الطلب"
          dismissible={!submitting}
          footer={
            <div className={styles.dialogActions}>
              <Button
                variant="secondary"
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
              >
                تراجع
              </Button>
              <Button
                loading={submitting}
                onClick={() => void confirmStatusUpdate()}
              >
                تأكيد الحفظ
              </Button>
            </div>
          }
        >
          <div className={styles.confirmStatus}>
            <span>الحالة الجديدة</span>
            <TourRequestStatusBadge status={status} />
            {note.trim() && <p>{note.trim()}</p>}
          </div>
        </Dialog>
      </main>
    </PageContainer>
  );
}

function Meta({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd dir={ltr ? "ltr" : undefined}>{value}</dd>
    </div>
  );
}
