"use client";

import Link from "next/link";
import { useState } from "react";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { Button, Card, Dialog } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import { deleteScientificVideo } from "../application/scientific-videos.client";
import {
  scientificVideoStatus,
  type ScientificVideoItem,
  type ScientificVideoOptions,
} from "../domain/scientific-videos";
import styles from "./scientific-videos.module.css";

const statusLabels = {
  draft: "مسودة",
  scheduled: "مجدول",
  published: "منشور",
} as const;
const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("ar-SA", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "غير محدد";

export function ScientificVideoDetail({
  item,
  options,
  notice,
}: {
  item: ScientificVideoItem;
  options: ScientificVideoOptions;
  notice?: "created" | "updated";
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = scientificVideoStatus(item);
  const sourceUrl =
    item.source_type === "file" ? item.admin_file_url : item.source_link;

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteScientificVideo(item.id);
      window.location.assign("/dashboard/scientific-videos?notice=deleted");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "تعذر حذف المادة المرئية.",
      );
      setDeleting(false);
    }
  }

  return (
    <section className={styles.detailStack} dir="rtl">
      {notice && (
        <div className={styles.success} role="status">
          {notice === "created"
            ? "تمت إضافة المادة المرئية بنجاح."
            : "تم حفظ التعديلات بنجاح."}
        </div>
      )}
      <div className={styles.detailHero}>
        <div
          className={styles.detailThumbnail}
          style={
            item.thumbnail_url
              ? {
                  backgroundImage: `url(${JSON.stringify(item.thumbnail_url)})`,
                }
              : undefined
          }
        >
          <span>▶</span>
        </div>
        <div className={styles.detailIntro}>
          <div className={styles.badges}>
            <span>{item.category}</span>
            <span className={styles[`status_${status}`]}>
              {statusLabels[status]}
            </span>
            {item.is_featured && <b>مميز في الرئيسية</b>}
          </div>
          <h1>{item.title}</h1>
          <p>{item.description}</p>
          <div className={styles.heroActions}>
            {sourceUrl && (
              <a
                className="ui-button ui-button--primary ui-focus"
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                {item.source_type === "file"
                  ? "معاينة الفيديو الخاص"
                  : "فتح المصدر"}
              </a>
            )}
            <Link
              className="ui-button ui-button--secondary ui-focus"
              href={`/dashboard/scientific-videos/${item.id}/edit`}
            >
              تعديل
            </Link>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              حذف
            </Button>
          </div>
        </div>
      </div>
      <div className={styles.stats}>
        <article>
          <span>المدة</span>
          <strong>{formatArabicNumber(item.duration_minutes)} دقيقة</strong>
        </article>
        <article>
          <span>المشاهدات</span>
          <strong>{formatArabicNumber(item.views_count)}</strong>
        </article>
        <article>
          <span>تاريخ العرض</span>
          <strong>{item.date_label}</strong>
        </article>
      </div>
      <div className={styles.detailGrid}>
        <Card className={styles.detailCard ?? ""}>
          <h2>بيانات المادة</h2>
          <dl>
            <div>
              <dt>التصنيف</dt>
              <dd>{item.category}</dd>
            </div>
            <div>
              <dt>الرابط المختصر</dt>
              <dd dir="ltr">{item.slug}</dd>
            </div>
            <div>
              <dt>نوع المصدر</dt>
              <dd>
                {options.source_types.find(
                  (option) => option.value === item.source_type,
                )?.label ?? item.source_type}
              </dd>
            </div>
            <div>
              <dt>التحميل</dt>
              <dd>{item.download_allowed ? "مسموح" : "غير مسموح"}</dd>
            </div>
          </dl>
        </Card>
        <Card className={styles.detailCard ?? ""}>
          <h2>السجل الزمني</h2>
          <dl>
            <div>
              <dt>موعد النشر</dt>
              <dd>{formatDate(item.published_at)}</dd>
            </div>
            <div>
              <dt>تاريخ الإنشاء</dt>
              <dd>{formatDate(item.created_at)}</dd>
            </div>
            <div>
              <dt>آخر تحديث</dt>
              <dd>{formatDate(item.updated_at)}</dd>
            </div>
            <div>
              <dt>حالة الظهور</dt>
              <dd>{statusLabels[status]}</dd>
            </div>
          </dl>
        </Card>
      </div>
      {item.keywords.length > 0 && (
        <Card className={styles.detailCard ?? ""}>
          <h2>الكلمات المفتاحية</h2>
          <div className={styles.keywords}>
            {item.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </Card>
      )}
      <Link className={styles.back} href="/dashboard/scientific-videos">
        العودة إلى قسم {dashboardCopy.modules.scientificVideos.navigation}
      </Link>
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !deleting && setDeleteOpen(open)}
        title="حذف المادة المرئية نهائيًا"
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
        <div className={styles.danger}>
          <strong>{item.title}</strong>
          <p>سيُحذف السجل والفيديو والصورة المصغرة نهائيًا.</p>
          {error && <p role="alert">{error}</p>}
        </div>
      </Dialog>
    </section>
  );
}
