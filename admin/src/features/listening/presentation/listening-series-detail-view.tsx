"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Card, Dialog } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import { deleteListeningSeries } from "../application/listening.client";
import type { ListeningSeries } from "../domain/listening.contracts";
import styles from "./listening.module.css";

const visualLabels: Record<string, string> = {
  gold: "ذهبي",
  sage: "أخضر هادئ",
  clay: "طيني",
  bronze: "برونزي",
  slate: "أردوازي",
};

function formatDate(value?: string | null): string {
  if (!value) return "غير محدد";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("ar-EG-u-nu-arab", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Cairo",
      }).format(date);
}

function safeUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol)
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function ListeningSeriesDetailView({
  series,
  sourceUrl,
  notice,
}: {
  series: ListeningSeries;
  sourceUrl?: string;
  notice?: "created" | "updated";
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const source = safeUrl(sourceUrl);

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteListeningSeries(series.id);
      window.location.assign("/dashboard/listening?notice=deleted");
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "تعذر حذف السلسلة.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const sourceLabel =
    series.book_source_type === "file"
      ? "ملف كتاب مرفوع"
      : series.book_source_type === "link"
        ? "رابط كتاب خارجي"
        : "بدون كتاب";

  return (
    <section dir="rtl" className={styles.detailStack}>
      {notice && (
        <div className={styles.notice} role="status">
          {notice === "created"
            ? "تمت إضافة السلسلة بنجاح."
            : "تم حفظ التعديلات بنجاح."}
        </div>
      )}

      <section className={styles.detailHero}>
        <div className={styles.heroBadges}>
          <span
            className={`${styles.badge} ${series.is_published ? "" : styles.draftBadge}`}
          >
            {series.is_published ? "مفعّلة للنشر" : "مسودة"}
          </span>
          <span className={styles.badge}>{series.category}</span>
          <span className={styles.badge}>{sourceLabel}</span>
        </div>
        <h1>{series.title}</h1>
        <p>
          {series.short_title} · {series.period_label} · {" "}
          {formatArabicNumber(series.sessions_count)} مجلس
        </p>
        <div className={styles.heroActions}>
          {source && (
            <a
              href={source}
              target="_blank"
              rel="noreferrer"
              className="ui-button ui-button--primary ui-focus"
            >
              {series.book_source_type === "file" ? "فتح الكتاب" : "فتح الرابط"}
            </a>
          )}
          <Link
            href={`/dashboard/listening/sessions?series_id=${series.id}`}
            className="ui-button ui-button--secondary ui-focus"
          >
            إدارة المجالس
          </Link>
          <Link
            href={`/dashboard/listening/${series.id}/edit`}
            className="ui-button ui-button--secondary ui-focus"
          >
            تعديل السلسلة
          </Link>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            حذف السلسلة
          </Button>
        </div>
      </section>

      <div className={styles.detailGrid}>
        <Card className={styles.detailCard ?? ""}>
          <h2>بيانات السلسلة</h2>
          <dl className={styles.metadataList}>
            <div>
              <dt>العنوان المختصر</dt>
              <dd>{series.short_title}</dd>
            </div>
            <div>
              <dt>الرابط المختصر</dt>
              <dd dir="ltr">{series.slug ?? "يُنشأ تلقائيًا"}</dd>
            </div>
            <div>
              <dt>التصنيف</dt>
              <dd>{series.category}</dd>
            </div>
            <div>
              <dt>الفترة</dt>
              <dd>{series.period_label}</dd>
            </div>
            <div>
              <dt>المظهر</dt>
              <dd>
                {series.visual_variant
                  ? visualLabels[series.visual_variant] ?? series.visual_variant
                  : "افتراضي"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className={styles.detailCard ?? ""}>
          <h2>المجالس والنشر</h2>
          <dl className={styles.metadataList}>
            <div>
              <dt>إجمالي المجالس</dt>
              <dd>{formatArabicNumber(series.sessions_count)}</dd>
            </div>
            <div>
              <dt>المجالس المنشورة</dt>
              <dd>{formatArabicNumber(series.published_sessions_count)}</dd>
            </div>
            <div>
              <dt>تحميل الكتاب</dt>
              <dd>{series.book_download_allowed ? "مسموح" : "غير مسموح"}</dd>
            </div>
            <div>
              <dt>تاريخ النشر</dt>
              <dd>{formatDate(series.published_at)}</dd>
            </div>
            <div>
              <dt>تاريخ الإنشاء</dt>
              <dd>{formatDate(series.created_at)}</dd>
            </div>
            <div>
              <dt>آخر تحديث</dt>
              <dd>{formatDate(series.updated_at)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className={styles.detailCard ?? ""}>
        <h2>وصف السلسلة</h2>
        <p className={styles.prose}>{series.description}</p>
      </Card>

      <Link
        href="/dashboard/listening"
        className="ui-button ui-button--secondary ui-focus"
      >
        العودة إلى السلاسل
      </Link>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !deleting && setDeleteOpen(open)}
        title="حذف السلسلة نهائيًا"
        dismissible={!deleting}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
            >
              تراجع
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={() => void confirmDelete()}
            >
              تأكيد الحذف
            </Button>
          </div>
        }
      >
        <div className={styles.dangerMessage}>
          <strong>{series.title}</strong>
          <p>
            سيُحذف سجل السلسلة وكل مجالسها وملفات الكتاب والصوت المرتبطة بها
            نهائيًا.
          </p>
          {deleteError && <p role="alert">{deleteError}</p>}
        </div>
      </Dialog>
    </section>
  );
}
