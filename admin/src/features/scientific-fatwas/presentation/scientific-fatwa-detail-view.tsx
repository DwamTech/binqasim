"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Card, Dialog } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import { deleteScientificFatwa } from "../application/scientific-fatwas.client";
import { publicationLabel } from "../application/scientific-fatwas.form";
import type { ScientificFatwaItem } from "../domain/scientific-fatwas.contracts";
import styles from "./scientific-fatwas.module.css";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ScientificFatwaDetailView({
  item,
  notice,
}: {
  item: ScientificFatwaItem;
  notice?: "created" | "updated";
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteScientificFatwa(item.id);
      window.location.assign("/dashboard/scientific-fatwas?notice=deleted");
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "تعذر حذف المسألة.",
      );
      setDeleting(false);
    }
  }

  return (
    <section dir="rtl" className={styles.detailStack}>
      {notice && (
        <div className={styles.notice} role="status">
          {notice === "created"
            ? "تمت إضافة المسألة بنجاح."
            : "تم حفظ التعديلات بنجاح."}
        </div>
      )}
      <section className={styles.detailHero}>
        <div className={styles.heroBadges}>
          <span className={styles.badge}>{item.category}</span>
          <span
            className={`${styles.badge} ${item.status === "draft" ? styles.draftBadge : item.status === "scheduled" ? styles.scheduledBadge : ""}`}
          >
            {publicationLabel(item)}
          </span>
          {item.is_featured && (
            <span className={`${styles.badge} ${styles.featuredBadge}`}>
              المسألة المختارة
            </span>
          )}
          <span
            className={`${styles.badge} ${item.is_listed ? styles.featuredBadge : styles.draftBadge}`}
          >
            {item.is_listed ? "ظاهرة في قائمة الفتاوى" : "متاحة بالرابط فقط"}
          </span>
          {item.managed_by_inbox && (
            <span className={`${styles.badge} ${styles.scheduledBadge}`}>
              مُدارة من صندوق الأسئلة
            </span>
          )}
        </div>
        <h1>{item.title}</h1>
        <p>
          {item.date_label} · {formatArabicNumber(item.sources.length)} مراجع ·{" "}
          {formatArabicNumber(item.keywords.length)} كلمات مفتاحية
        </p>
        <div className={styles.heroActions}>
          {item.status === "published" && item.public_url && (
            <a
              href={item.public_url}
              target="_blank"
              rel="noreferrer"
              className="ui-button ui-button--primary ui-focus"
            >
              فتح الصفحة العامة
            </a>
          )}
          {item.managed_by_inbox && item.source_fatwa_id ? (
            <Link
              href={`/dashboard/scientific-fatwas/inbox/${item.source_fatwa_id}`}
              className="ui-button ui-button--secondary ui-focus"
            >
              إدارة الرد من صندوق الأسئلة
            </Link>
          ) : (
            <>
              <Link
                href={`/dashboard/scientific-fatwas/${item.id}/edit`}
                className="ui-button ui-button--secondary ui-focus"
              >
                تعديل المسألة
              </Link>
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                حذف المسألة
              </Button>
            </>
          )}
        </div>
      </section>

      <div className={styles.detailGrid}>
        <Card className={styles.detailCard ?? ""}>
          <h2>نص السؤال</h2>
          <p className={styles.prose}>{item.question}</p>
        </Card>
        <Card className={styles.detailCard ?? ""}>
          <h2>بيانات النشر</h2>
          <dl className={styles.metadataList}>
            <div>
              <dt>معرّف الرابط العام</dt>
              <dd dir="ltr">{item.slug}</dd>
            </div>
            <div>
              <dt>الظهور في القائمة</dt>
              <dd>{item.is_listed ? "ظاهرة" : "بالرابط فقط"}</dd>
            </div>
            <div>
              <dt>تاريخ العرض</dt>
              <dd>{item.date_label}</dd>
            </div>
            <div>
              <dt>موعد النشر</dt>
              <dd>{formatDate(item.published_at)}</dd>
            </div>
            <div>
              <dt>آخر تحديث</dt>
              <dd>{formatDate(item.updated_at)}</dd>
            </div>
          </dl>
        </Card>
      </div>
      <Card className={styles.detailCard ?? ""}>
        <h2>الجواب العلمي</h2>
        <p className={styles.prose}>{item.answer}</p>
      </Card>
      <div className={styles.detailGrid}>
        <Card className={styles.detailCard ?? ""}>
          <h2>المصادر والمراجع</h2>
          {item.sources.length ? (
            <ol className={styles.referenceList}>
              {item.sources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ol>
          ) : (
            <p className={styles.muted}>لا توجد مراجع مضافة.</p>
          )}
        </Card>
        <Card className={styles.detailCard ?? ""}>
          <h2>الكلمات المفتاحية</h2>
          {item.keywords.length ? (
            <div className={styles.keywordList}>
              {item.keywords.map((keyword) => (
                <span key={keyword}>{keyword}</span>
              ))}
            </div>
          ) : (
            <p className={styles.muted}>لا توجد كلمات مفتاحية.</p>
          )}
        </Card>
      </div>
      <Link
        href="/dashboard/scientific-fatwas"
        className="ui-button ui-button--secondary ui-focus"
      >
        العودة إلى المسائل
      </Link>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !deleting && setDeleteOpen(open)}
        title="حذف المسألة نهائيًا"
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
          <strong>{item.title}</strong>
          <p>سيُحذف هذا السجل من مكتبة الفتاوى المنشورة نهائيًا.</p>
          {deleteError && <p role="alert">{deleteError}</p>}
        </div>
      </Dialog>
    </section>
  );
}
