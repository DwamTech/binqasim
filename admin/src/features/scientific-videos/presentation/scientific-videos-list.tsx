"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, Dialog } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import { deleteScientificVideo } from "../application/scientific-videos.client";
import {
  scientificVideoStatus,
  type ScientificVideoItem,
  type ScientificVideoOptions,
  type ScientificVideoPage,
  type ScientificVideoQuery,
} from "../domain/scientific-videos";
import { scientificVideoHref } from "../infrastructure/scientific-videos.query";
import styles from "./scientific-videos.module.css";

const statusLabels = {
  draft: "مسودة",
  scheduled: "مجدول",
  published: "منشور",
} as const;

export function ScientificVideosList({
  page,
  query,
  options,
  deletedNotice,
}: {
  page: ScientificVideoPage;
  query: ScientificVideoQuery;
  options: ScientificVideoOptions;
  deletedNotice?: boolean;
}) {
  const [deleteTarget, setDeleteTarget] = useState<ScientificVideoItem | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteScientificVideo(deleteTarget.id);
      window.location.assign("/dashboard/scientific-videos?notice=deleted");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "تعذر حذف المادة المرئية.",
      );
      setDeleting(false);
    }
  }

  return (
    <section className={styles.stack} dir="rtl">
      {deletedNotice && (
        <div className={styles.success} role="status">
          تم حذف المادة المرئية وملفاتها بنجاح.
        </div>
      )}
      <Card className={styles.filters ?? ""}>
        <form method="get" action="/dashboard/scientific-videos">
          <label>
            <span>البحث</span>
            <input
              className="ui-input"
              name="search"
              defaultValue={query.search ?? ""}
              placeholder="العنوان أو الوصف أو الكلمات المفتاحية"
            />
          </label>
          <label>
            <span>التصنيف</span>
            <select
              className="ui-input"
              name="category"
              defaultValue={query.category ?? ""}
            >
              <option value="">كل التصنيفات</option>
              {options.categories.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>حالة النشر</span>
            <select
              className="ui-input"
              name="status"
              defaultValue={query.status ?? ""}
            >
              <option value="">كل الحالات</option>
              {options.statuses.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>نوع المصدر</span>
            <select
              className="ui-input"
              name="source_type"
              defaultValue={query.source_type ?? ""}
            >
              <option value="">كل المصادر</option>
              {options.source_types.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>التمييز</span>
            <select
              className="ui-input"
              name="is_featured"
              defaultValue={query.is_featured ?? ""}
            >
              <option value="">الكل</option>
              <option value="1">مميز فقط</option>
              <option value="0">غير مميز</option>
            </select>
          </label>
          <input type="hidden" name="per_page" value={query.per_page} />
          <div className={styles.filterActions}>
            <button
              className="ui-button ui-button--primary ui-focus"
              type="submit"
            >
              تطبيق الفلاتر
            </button>
            <Link
              className="ui-button ui-button--secondary ui-focus"
              href="/dashboard/scientific-videos"
            >
              مسح
            </Link>
          </div>
        </form>
      </Card>

      <div className={styles.summary}>
        <span>
          إجمالي المواد <strong>{formatArabicNumber(page.meta.total)}</strong>
        </span>
        <span>
          المعروض <strong>{formatArabicNumber(page.data.length)}</strong>
        </span>
      </div>

      {page.data.length === 0 ? (
        <Card className={styles.empty ?? ""}>
          <strong>لا توجد مواد مطابقة</strong>
          <p>غيّر معايير البحث أو أضف أول مادة مرئية.</p>
          <Link
            className="ui-button ui-button--primary ui-focus"
            href="/dashboard/scientific-videos/new"
          >
            إضافة مادة مرئية
          </Link>
        </Card>
      ) : (
        <div className={styles.grid}>
          {page.data.map((item) => {
            const status = scientificVideoStatus(item);
            return (
              <article className={styles.itemCard} key={item.id}>
                <div
                  className={styles.thumbnail}
                  style={
                    item.thumbnail_url
                      ? {
                          backgroundImage: `url(${JSON.stringify(item.thumbnail_url)})`,
                        }
                      : undefined
                  }
                >
                  <span>▶</span>
                  {item.is_featured && <b>مميز</b>}
                </div>
                <div className={styles.itemCopy}>
                  <div className={styles.badges}>
                    <span>{item.category}</span>
                    <span className={styles[`status_${status}`]}>
                      {statusLabels[status]}
                    </span>
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <dl>
                    <div>
                      <dt>المدة</dt>
                      <dd>{formatArabicNumber(item.duration_minutes)} دقيقة</dd>
                    </div>
                    <div>
                      <dt>المشاهدات</dt>
                      <dd>{formatArabicNumber(item.views_count)}</dd>
                    </div>
                    <div>
                      <dt>المصدر</dt>
                      <dd>
                        {options.source_types.find(
                          (option) => option.value === item.source_type,
                        )?.label ?? item.source_type}
                      </dd>
                    </div>
                  </dl>
                </div>
                <footer>
                  <Link
                    className="ui-button ui-button--secondary ui-focus"
                    href={`/dashboard/scientific-videos/${item.id}`}
                  >
                    التفاصيل
                  </Link>
                  <Link
                    className="ui-button ui-button--secondary ui-focus"
                    href={`/dashboard/scientific-videos/${item.id}/edit`}
                  >
                    تعديل
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => setDeleteTarget(item)}
                  >
                    حذف
                  </Button>
                </footer>
              </article>
            );
          })}
        </div>
      )}

      {page.meta.last_page > 1 && (
        <nav className={styles.pagination} aria-label="صفحات المرئيات">
          <Link
            aria-disabled={page.meta.current_page <= 1}
            className={`ui-button ui-button--secondary ui-focus ${page.meta.current_page <= 1 ? styles.disabled : ""}`}
            href={scientificVideoHref(query, {
              page: Math.max(1, page.meta.current_page - 1),
            })}
          >
            السابق
          </Link>
          <span>
            صفحة <strong>{formatArabicNumber(page.meta.current_page)}</strong>{" "}
            من {formatArabicNumber(page.meta.last_page)}
          </span>
          <Link
            aria-disabled={page.meta.current_page >= page.meta.last_page}
            className={`ui-button ui-button--secondary ui-focus ${page.meta.current_page >= page.meta.last_page ? styles.disabled : ""}`}
            href={scientificVideoHref(query, {
              page: Math.min(page.meta.last_page, page.meta.current_page + 1),
            })}
          >
            التالي
          </Link>
        </nav>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
        title="حذف المادة المرئية نهائيًا"
        dismissible={!deleting}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
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
          <strong>{deleteTarget?.title}</strong>
          <p>
            سيُحذف السجل وملف الفيديو والصورة المصغرة. لا يمكن التراجع عن
            العملية.
          </p>
          {error && <p role="alert">{error}</p>}
        </div>
      </Dialog>
    </section>
  );
}
