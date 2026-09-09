"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Card, Dialog } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import { deleteBook } from "../application/books.client";
import type {
  AdminBookDetailResponse,
  BookSourceType,
} from "../domain/books.contracts";
import { formatBookDate, safeExternalUrl } from "./books-detail.helpers";
import { GeneratedBookCover } from "./generated-book-cover";
import styles from "./books.module.css";
import type { LibraryAreaSlug } from "../domain/library-areas";

const sourceTypeLabels: Record<BookSourceType, string> = {
  file: "ملف مرفوع",
  link: "رابط خارجي",
  embed: "رابط تضمين",
};

export function BooksDetailView({
  detail,
  fileUrl,
  notice,
  basePath = "/dashboard/books",
  area,
  publicMetadataFields = false,
}: {
  detail: AdminBookDetailResponse;
  fileUrl?: string;
  notice?: "created" | "updated";
  basePath?: string;
  area?: LibraryAreaSlug;
  publicMetadataFields?: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { book, related_parts: relatedParts } = detail;
  const externalUrl =
    book.source_type === "file" ? fileUrl : safeExternalUrl(book.source_link);

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteBook(String(book.id), area);
      window.location.assign(`${basePath}?notice=deleted`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : `تعذر حذف ${dashboardCopy.modules.books.singular}.`,
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section dir="rtl" className={styles.detailStack}>
      {(notice === "created" || notice === "updated") && (
        <div className={styles.notice} role="status">
          {notice === "created"
            ? "تمت إضافة الكتاب بنجاح."
            : "تم حفظ تعديلات الكتاب بنجاح."}
        </div>
      )}

      <div className={styles.detailHero}>
        <GeneratedBookCover title={book.title} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadges}>
            <span className={styles.badge}>
              {book.type === "single" ? "كتاب مستقل" : "جزء من سلسلة"}
            </span>
            <span className={`${styles.badge} ${styles.badgeSource}`}>
              {sourceTypeLabels[book.source_type]}
            </span>
          </div>
          <p className={styles.eyebrow}>
            BOOK-{String(book.id).padStart(4, "0")}
          </p>
          <h1>{book.title}</h1>
          <p className={styles.heroDescription}>{book.description}</p>
          <div className={styles.heroActions}>
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className="ui-button ui-button--primary ui-focus"
              >
                {book.source_type === "file" ? "فتح ملف الكتاب" : "فتح المصدر"}
              </a>
            )}
            <Link
              href={`${basePath}/${book.id}/edit`}
              className="ui-button ui-button--secondary ui-focus"
            >
              {dashboardCopy.modules.books.pages.edit}
            </Link>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              حذف {dashboardCopy.modules.books.singular}
            </Button>
          </div>
        </div>
      </div>

      <section className={styles.statsGrid} aria-label="إحصائيات الكتاب">
        <article>
          <span>المشاهدات</span>
          <strong>{formatArabicNumber(book.views_count)}</strong>
        </article>
        <article>
          <span>متوسط التقييم</span>
          <strong>
            {formatArabicNumber(book.average_rating, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            / ٥
          </strong>
        </article>
        <article>
          <span>عدد التقييمات</span>
          <strong>{formatArabicNumber(book.rating_count)}</strong>
        </article>
      </section>

      <div className={styles.detailGrid}>
        <Card className={styles.detailCard ?? ""}>
          <div className={styles.cardTitle}>
            <span>٠١</span>
            <div>
              <h2>معلومات النشر</h2>
              <p>التصنيف والملكية التنظيمية للكتاب.</p>
            </div>
          </div>
          <dl className={styles.metadataList}>
            <div>
              <dt>المؤلف</dt>
              <dd>{book.author_name}</dd>
            </div>
            <div>
              <dt>القسم</dt>
              <dd>{book.section?.name ?? "بدون قسم"}</dd>
            </div>
            <div>
              <dt>السلسلة</dt>
              <dd>{book.series?.name ?? "غير مرتبط بسلسلة"}</dd>
            </div>
            <div>
              <dt>نوع الغلاف</dt>
              <dd>
                {book.cover_type === "upload" ? "غلاف مرفوع" : "غلاف افتراضي"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className={styles.detailCard ?? ""}>
          <div className={styles.cardTitle}>
            <span>٠٢</span>
            <div>
              <h2>السجل الزمني</h2>
              <p>آخر توقيتات معتمدة من Backend.</p>
            </div>
          </div>
          <dl className={styles.metadataList}>
            <div>
              <dt>تاريخ الإنشاء</dt>
              <dd>{formatBookDate(book.created_at)}</dd>
            </div>
            <div>
              <dt>آخر تحديث</dt>
              <dd>{formatBookDate(book.updated_at)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {publicMetadataFields && (
        <Card className={styles.detailCard ?? ""}>
          <div className={styles.cardTitle}>
            <span>٠٣</span>
            <div>
              <h2>بيانات العرض العام</h2>
              <p>القيم المستخدمة في كرت المكتبة وصفحة القراءة.</p>
            </div>
          </div>
          <dl className={styles.metadataList}>
            <div>
              <dt>الرابط المختصر</dt>
              <dd dir="ltr">{book.slug ?? "غير محدد"}</dd>
            </div>
            <div>
              <dt>العنوان المختصر</dt>
              <dd>{book.short_title ?? "غير محدد"}</dd>
            </div>
            <div>
              <dt>عدد الصفحات</dt>
              <dd>
                {book.pages_count
                  ? `${formatArabicNumber(book.pages_count)} صفحة`
                  : "غير محدد"}
              </dd>
            </div>
            <div>
              <dt>الطبعة</dt>
              <dd>{book.edition ?? "غير محدد"}</dd>
            </div>
            <div>
              <dt>معلومات النشر</dt>
              <dd>{book.publication_info ?? "غير محدد"}</dd>
            </div>
            <div>
              <dt>حالة الظهور</dt>
              <dd>{book.is_published ? "منشور للعامة" : "غير منشور"}</dd>
            </div>
            <div>
              <dt>التحميل</dt>
              <dd>{book.download_allowed ? "مسموح" : "غير مسموح"}</dd>
            </div>
            <div>
              <dt>تاريخ النشر</dt>
              <dd>
                {book.published_at
                  ? formatBookDate(book.published_at)
                  : "غير محدد"}
              </dd>
            </div>
          </dl>
        </Card>
      )}

      {book.keywords && book.keywords.length > 0 && (
        <Card className={styles.detailCard ?? ""}>
          <div className={styles.cardTitle}>
            <span>{publicMetadataFields ? "٠٤" : "٠٣"}</span>
            <div>
              <h2>الكلمات المفتاحية</h2>
              <p>مصطلحات تساعد في وصف الكتاب والوصول إليه.</p>
            </div>
          </div>
          <div className={styles.keywordList}>
            {book.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </Card>
      )}

      {relatedParts.length > 0 && (
        <Card className={styles.detailCard ?? ""}>
          <div className={styles.cardTitle}>
            <span>{publicMetadataFields ? "٠٥" : "٠٤"}</span>
            <div>
              <h2>أجزاء من نفس السلسلة</h2>
              <p>انتقل مباشرة بين الكتب المرتبطة.</p>
            </div>
          </div>
          <div className={styles.relatedGrid}>
            {relatedParts.map((part) => (
              <Link key={part.id} href={`${basePath}/${part.id}`}>
                <span>{part.title.slice(0, 1)}</span>
                <strong>{part.title}</strong>
                <small>عرض الجزء ←</small>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <Link href={basePath} className={styles.backLink}>
        العودة إلى قائمة الكتب
      </Link>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !deleting && setDeleteOpen(open)}
        title={`حذف ${dashboardCopy.modules.books.singular} نهائيًا`}
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
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              تأكيد الحذف
            </Button>
          </div>
        }
      >
        <div className={styles.dangerMessage}>
          <strong>{book.title}</strong>
          <p>سيُحذف سجل الكتاب نهائيًا من قاعدة البيانات.</p>
          {error && <p role="alert">{error}</p>}
        </div>
      </Dialog>
    </section>
  );
}
