"use client";

import Link from "next/link";
import { useState } from "react";

import { deleteDissertation } from "../application/dissertations.client";
import {
  dissertationPublicationStatusOf,
  type Dissertation,
} from "../domain/dissertations.contracts";
import { toArabicDigits } from "@/shared/lib/arabic-format";
import { Button, Card, Dialog } from "@/shared/components/ui";
import styles from "./dissertations.module.css";

function formatDate(value?: string | null): string {
  if (!value) return "غير محدد";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("ar-EG-u-nu-arab", {
        dateStyle: "medium",
        timeZone: "Africa/Cairo",
      }).format(date);
}

function safeSourceUrl(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function DissertationDetailView({
  dissertation,
  sourceUrl,
  notice,
}: {
  dissertation: Dissertation;
  sourceUrl?: string;
  notice?: "created" | "updated";
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const safeSource = safeSourceUrl(sourceUrl);
  const publicationStatus = dissertationPublicationStatusOf(dissertation);
  const publicationLabel = {
    draft: "مسودة",
    scheduled: "مجدول للنشر",
    published: "منشور للعامة",
  }[publicationStatus];
  const sourceLabel =
    dissertation.source_type === "file"
      ? "ملف مرفوع"
      : dissertation.source_type === "link"
        ? "رابط خارجي"
        : dissertation.source_type === "embed"
          ? "رابط تضمين"
          : "بدون مصدر";

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteDissertation(dissertation.id);
      window.location.assign("/dashboard/dissertations?notice=deleted");
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "تعذر حذف الرسالة العلمية.",
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
            ? "تمت إضافة الرسالة العلمية بنجاح."
            : "تم حفظ التعديلات بنجاح."}
        </div>
      )}

      <section className={styles.detailHero}>
        <div className={styles.heroBadges}>
          <span
            className={`${styles.badge} ${publicationStatus === "draft" ? styles.draftBadge : publicationStatus === "scheduled" ? styles.scheduledBadge : ""}`}
          >
            {publicationLabel}
          </span>
          {dissertation.degree && (
            <span className={styles.badge}>{dissertation.degree}</span>
          )}
          <span className={styles.badge}>{sourceLabel}</span>
        </div>
        <h1>{dissertation.title}</h1>
        <p>
          {[
            dissertation.researcher_name,
            dissertation.university,
            dissertation.year ? `${toArabicDigits(dissertation.year)}هـ` : "",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className={styles.heroActions}>
          {safeSource && (
            <a
              href={safeSource}
              target="_blank"
              rel="noreferrer"
              className="ui-button ui-button--primary ui-focus"
            >
              {dissertation.source_type === "file"
                ? "فتح ملف الرسالة"
                : "فتح المصدر"}
            </a>
          )}
          <Link
            href={`/dashboard/dissertations/${dissertation.id}/edit`}
            className="ui-button ui-button--secondary ui-focus"
          >
            تعديل الرسالة
          </Link>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            حذف الرسالة
          </Button>
        </div>
      </section>

      <div className={styles.detailGrid}>
        <Card className={styles.detailCard ?? ""}>
          <h2>البيانات الأكاديمية</h2>
          <dl className={styles.metadataList}>
            <div>
              <dt>الباحث</dt>
              <dd>{dissertation.researcher_name}</dd>
            </div>
            <div>
              <dt>الجامعة</dt>
              <dd>{dissertation.university || "غير محدد"}</dd>
            </div>
            <div>
              <dt>الكلية</dt>
              <dd>{dissertation.college || "غير محدد"}</dd>
            </div>
            <div>
              <dt>التخصص</dt>
              <dd>{dissertation.specialization || "غير محدد"}</dd>
            </div>
            <div>
              <dt>الدرجة العلمية</dt>
              <dd>{dissertation.degree || "غير محدد"}</dd>
            </div>
            <div>
              <dt>السنة</dt>
              <dd>
                {dissertation.year
                  ? `${toArabicDigits(dissertation.year)}هـ`
                  : "غير محدد"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className={styles.detailCard ?? ""}>
          <h2>المشاركة والنشر</h2>
          <dl className={styles.metadataList}>
            <div>
              <dt>نوع المشاركة</dt>
              <dd>{dissertation.participation_type || "غير محدد"}</dd>
            </div>
            <div>
              <dt>الرابط المختصر</dt>
              <dd dir="ltr">{dissertation.slug}</dd>
            </div>
            <div>
              <dt>حالة النشر</dt>
              <dd>{publicationLabel}</dd>
            </div>
            <div>
              <dt>تاريخ النشر</dt>
              <dd>{formatDate(dissertation.published_at)}</dd>
            </div>
            <div>
              <dt>تاريخ الإنشاء</dt>
              <dd>{formatDate(dissertation.created_at)}</dd>
            </div>
            <div>
              <dt>آخر تحديث</dt>
              <dd>{formatDate(dissertation.updated_at)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className={styles.detailCard ?? ""}>
        <h2>ملخص الرسالة</h2>
        <p className={styles.prose}>
          {dissertation.abstract || "لم يُضف ملخص لهذه الرسالة بعد."}
        </p>
      </Card>

      {dissertation.participation_description && (
        <Card className={styles.detailCard ?? ""}>
          <h2>وصف المشاركة</h2>
          <p className={styles.prose}>
            {dissertation.participation_description}
          </p>
        </Card>
      )}

      {dissertation.keywords.length > 0 && (
        <Card className={styles.detailCard ?? ""}>
          <h2>الكلمات المفتاحية</h2>
          <div className={styles.keywords}>
            {dissertation.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </Card>
      )}

      <Link
        href="/dashboard/dissertations"
        className="ui-button ui-button--secondary ui-focus"
      >
        العودة إلى قائمة الرسائل
      </Link>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !deleting && setDeleteOpen(open)}
        title="حذف الرسالة العلمية نهائيًا"
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
          <strong>{dissertation.title}</strong>
          <p>سيُحذف السجل وملفه المرفوع نهائيًا.</p>
          {deleteError && <p role="alert">{deleteError}</p>}
        </div>
      </Dialog>
    </section>
  );
}
