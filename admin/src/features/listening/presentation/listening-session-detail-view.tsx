"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Card, Dialog } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import { deleteListeningSession } from "../application/listening.client";
import type { ListeningSession } from "../domain/listening.contracts";
import styles from "./listening.module.css";

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

export function ListeningSessionDetailView({
  session,
  sourceUrl,
  notice,
}: {
  session: ListeningSession;
  sourceUrl?: string;
  notice?: "created" | "updated";
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const source = safeUrl(sourceUrl);
  const sourceLabel =
    session.audio_source_type === "file"
      ? "ملف صوتي مرفوع"
      : session.audio_source_type === "link"
        ? "رابط صوتي خارجي"
        : "بدون تسجيل";

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteListeningSession(session.id);
      window.location.assign("/dashboard/listening/sessions?notice=deleted");
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "تعذر حذف المجلس.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section dir="rtl" className={styles.detailStack}>
      {notice && (
        <div className={styles.notice} role="status">
          {notice === "created"
            ? "تمت إضافة المجلس بنجاح."
            : "تم حفظ التعديلات بنجاح."}
        </div>
      )}

      <section className={styles.detailHero}>
        <div className={styles.heroBadges}>
          <span
            className={`${styles.badge} ${session.is_published ? "" : styles.draftBadge}`}
          >
            {session.is_published ? "مفعّل للنشر" : "مسودة"}
          </span>
          <span className={styles.badge}>{sourceLabel}</span>
          <span className={styles.badge}>
            المجلس {formatArabicNumber(session.sequence_number)}
          </span>
        </div>
        <h1>{session.title}</h1>
        <p>
          {session.series?.title ?? "سلسلة غير محددة"} · {session.date_label} · {" "}
          {formatArabicNumber(session.duration_minutes)} دقيقة
        </p>
        <div className={styles.heroActions}>
          {source && (
            <a
              href={source}
              target="_blank"
              rel="noreferrer"
              className="ui-button ui-button--primary ui-focus"
            >
              فتح التسجيل
            </a>
          )}
          <Link
            href={`/dashboard/listening/sessions/${session.id}/edit`}
            className="ui-button ui-button--secondary ui-focus"
          >
            تعديل المجلس
          </Link>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            حذف المجلس
          </Button>
        </div>
      </section>

      {source && (
        <Card className={styles.detailCard ?? ""}>
          <h2>معاينة التسجيل</h2>
          <audio className={styles.audioPlayer} controls preload="metadata" src={source}>
            متصفحك لا يدعم تشغيل الصوت.
          </audio>
        </Card>
      )}

      <div className={styles.detailGrid}>
        <Card className={styles.detailCard ?? ""}>
          <h2>بيانات المجلس</h2>
          <dl className={styles.metadataList}>
            <div>
              <dt>السلسلة</dt>
              <dd>{session.series?.title ?? "غير محددة"}</dd>
            </div>
            <div>
              <dt>الترتيب</dt>
              <dd>{formatArabicNumber(session.sequence_number)}</dd>
            </div>
            <div>
              <dt>الرابط المختصر</dt>
              <dd dir="ltr">{session.slug ?? "يُنشأ تلقائيًا"}</dd>
            </div>
            <div>
              <dt>تاريخ المجلس</dt>
              <dd>{session.date_label}</dd>
            </div>
            <div>
              <dt>المدة</dt>
              <dd>{formatArabicNumber(session.duration_minutes)} دقيقة</dd>
            </div>
          </dl>
        </Card>

        <Card className={styles.detailCard ?? ""}>
          <h2>المصدر والنشر</h2>
          <dl className={styles.metadataList}>
            <div>
              <dt>مصدر الصوت</dt>
              <dd>{sourceLabel}</dd>
            </div>
            <div>
              <dt>تحميل التسجيل</dt>
              <dd>{session.audio_download_allowed ? "مسموح" : "غير مسموح"}</dd>
            </div>
            <div>
              <dt>تاريخ النشر</dt>
              <dd>{formatDate(session.published_at)}</dd>
            </div>
            <div>
              <dt>تاريخ الإنشاء</dt>
              <dd>{formatDate(session.created_at)}</dd>
            </div>
            <div>
              <dt>آخر تحديث</dt>
              <dd>{formatDate(session.updated_at)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className={styles.detailCard ?? ""}>
        <h2>وصف المجلس</h2>
        <p className={styles.prose}>{session.description}</p>
      </Card>

      <Link
        href="/dashboard/listening/sessions"
        className="ui-button ui-button--secondary ui-focus"
      >
        العودة إلى المجالس
      </Link>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !deleting && setDeleteOpen(open)}
        title="حذف المجلس نهائيًا"
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
          <strong>{session.title}</strong>
          <p>سيُحذف سجل المجلس وملف التسجيل المرفوع نهائيًا.</p>
          {deleteError && <p role="alert">{deleteError}</p>}
        </div>
      </Dialog>
    </section>
  );
}
