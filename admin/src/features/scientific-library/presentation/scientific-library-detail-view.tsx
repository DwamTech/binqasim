"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Card, Dialog } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import { deleteScientificLibraryItem } from "../application/scientific-library.client";
import { scientificLibraryPrivateFileHref } from "../application/scientific-library-item.presenter";
import {
  scientificLibraryStatusOf,
  type ScientificLibraryItem,
  type ScientificLibraryOptions,
} from "../domain/scientific-library.contracts";
import {
  fileNameFromPath,
  formatScientificLibraryDate,
  optionLabel,
  safeLibraryUrl,
  scientificLibraryStatusLabels,
} from "./scientific-library.presentation";
import styles from "./scientific-library.module.css";

function DetailCover({ item }: { item: ScientificLibraryItem }) {
  const cover = safeLibraryUrl(item.cover_url, true);
  return (
    <div
      className={styles.detailCover}
      role="img"
      aria-label={`غلاف ${item.title}`}
      style={
        cover ? { backgroundImage: `url(${JSON.stringify(cover)})` } : undefined
      }
    >
      {!cover && (
        <div>
          <small>{item.content_type}</small>
          <strong>{item.short_title || item.title}</strong>
        </div>
      )}
    </div>
  );
}

export function ScientificLibraryDetailView({
  item,
  options,
  notice,
}: {
  item: ScientificLibraryItem;
  options: ScientificLibraryOptions;
  notice?: "created" | "updated";
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = scientificLibraryStatusOf(item);
  const privateFileUrl = scientificLibraryPrivateFileHref(item);
  const adminFileUrl = safeLibraryUrl(privateFileUrl, true);
  const sourceUrl = safeLibraryUrl(
    item.source_type === "file"
      ? privateFileUrl
      : (item.source_url ?? item.source_link),
    item.source_type === "file",
  );
  const readerUrl = safeLibraryUrl(
    item.source_type === "file" ? privateFileUrl : item.reader_url,
    true,
  );
  const downloadUrl = safeLibraryUrl(item.download_url, true);

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteScientificLibraryItem(item.id);
      window.location.assign("/dashboard/library?notice=deleted");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حذف المصنَّف.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className={styles.detailStack} dir="rtl">
      {notice && (
        <div className={styles.successNotice} role="status">
          {notice === "created"
            ? "تمت إضافة المصنَّف بنجاح."
            : "تم حفظ تعديلات المصنَّف بنجاح."}
        </div>
      )}

      <div className={styles.detailHero}>
        <DetailCover item={item} />
        <div className={styles.detailIntro}>
          <div className={styles.badgeRow}>
            <span
              className={`${styles.statusBadge} ${styles[`status_${status}`] ?? ""}`}
            >
              {scientificLibraryStatusLabels[status]}
            </span>
            {item.is_featured && (
              <span className={styles.featuredBadge}>مصنَّف مميز</span>
            )}
          </div>
          <span className={styles.eyebrow}>{item.content_type}</span>
          <h1>{item.title}</h1>
          <p className={styles.author}>{item.author_name}</p>
          <p className={styles.description}>{item.description}</p>
          <div className={styles.heroActions}>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="ui-button ui-button--primary ui-focus"
              >
                {item.source_type === "file"
                  ? "معاينة إدارية آمنة"
                  : "فتح المصدر"}
              </a>
            )}
            {readerUrl && readerUrl !== sourceUrl && (
              <a
                href={readerUrl}
                target="_blank"
                rel="noreferrer"
                className="ui-button ui-button--secondary ui-focus"
              >
                فتح القارئ العام
              </a>
            )}
            {item.download_allowed && downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="ui-button ui-button--secondary ui-focus"
              >
                اختبار التحميل المصرح
              </a>
            )}
            <Link
              href={`/dashboard/library/${item.id}/edit`}
              className="ui-button ui-button--secondary ui-focus"
            >
              تعديل المصنَّف
            </Link>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              حذف المصنَّف
            </Button>
          </div>
          {item.source_type === "file" && !adminFileUrl && (
            <div className={styles.warningNotice} role="status">
              الملف محفوظ باسم {fileNameFromPath(item.file_path)}، لكن الخادم لم
              يُرجع رابط معاينة إدارية آمنًا.
            </div>
          )}
        </div>
      </div>

      <section className={styles.stats} aria-label="إحصائيات المصنَّف">
        <article>
          <span>الصفحات</span>
          <strong>{formatArabicNumber(item.pages_count)}</strong>
        </article>
        <article>
          <span>المشاهدات</span>
          <strong>{formatArabicNumber(item.views_count)}</strong>
        </article>
        <article>
          <span>المجال العلمي</span>
          <strong>{item.scientific_field}</strong>
        </article>
      </section>

      <div className={styles.detailGrid}>
        <Card className={styles.detailCard ?? ""}>
          <h2>بيانات الإصدار</h2>
          <dl className={styles.metadataList}>
            <div>
              <dt>العنوان المختصر</dt>
              <dd>{item.short_title || "غير محدد"}</dd>
            </div>
            <div>
              <dt>الطبعة/الإصدار</dt>
              <dd>{item.edition}</dd>
            </div>
            <div>
              <dt>معلومات النشر</dt>
              <dd>{item.publication_info || "غير محدد"}</dd>
            </div>
            <div>
              <dt>الرابط المختصر</dt>
              <dd dir="ltr">{item.slug}</dd>
            </div>
          </dl>
        </Card>
        <Card className={styles.detailCard ?? ""}>
          <h2>المصدر والإتاحة</h2>
          <dl className={styles.metadataList}>
            <div>
              <dt>نوع المصدر</dt>
              <dd>{optionLabel(options.source_types, item.source_type)}</dd>
            </div>
            <div>
              <dt>التحميل</dt>
              <dd>{item.download_allowed ? "مسموح" : "غير مسموح"}</dd>
            </div>
            <div>
              <dt>التمييز</dt>
              <dd>{item.is_featured ? "مميز" : "عادي"}</dd>
            </div>
            <div>
              <dt>حالة النشر</dt>
              <dd>{scientificLibraryStatusLabels[status]}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className={styles.detailCard ?? ""}>
        <h2>السجل الزمني</h2>
        <dl className={styles.metadataList}>
          <div>
            <dt>موعد النشر</dt>
            <dd>{formatScientificLibraryDate(item.published_at)}</dd>
          </div>
          <div>
            <dt>تاريخ الإنشاء</dt>
            <dd>{formatScientificLibraryDate(item.created_at)}</dd>
          </div>
          <div>
            <dt>آخر تحديث</dt>
            <dd>{formatScientificLibraryDate(item.updated_at)}</dd>
          </div>
        </dl>
      </Card>

      {item.keywords.length > 0 && (
        <Card className={styles.detailCard ?? ""}>
          <h2>الكلمات المفتاحية</h2>
          <div className={styles.keywordList}>
            {item.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </Card>
      )}

      <Link href="/dashboard/library" className={styles.backLink}>
        العودة إلى المكتبة العلمية
      </Link>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !deleting && setDeleteOpen(open)}
        title="حذف المصنَّف نهائيًا"
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
          <strong>{item.title}</strong>
          <p>
            سيُحذف السجل والملف والغلاف المرتبطان به نهائيًا. لا يمكن التراجع عن
            هذه العملية.
          </p>
          {error && <p role="alert">{error}</p>}
        </div>
      </Dialog>
    </section>
  );
}
