"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Dialog, EmptyState, Select } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import { deleteScientificLibraryItem } from "../application/scientific-library.client";
import {
  scientificLibraryStatusOf,
  type ScientificLibraryItem,
  type ScientificLibraryOptions,
  type ScientificLibraryPage,
  type ScientificLibraryQuery,
} from "../domain/scientific-library.contracts";
import { scientificLibraryListHref } from "../infrastructure/scientific-library.query";
import {
  optionLabel,
  safeLibraryUrl,
  scientificLibraryStatusLabels,
} from "./scientific-library.presentation";
import styles from "./scientific-library.module.css";

function Cover({ item }: { item: ScientificLibraryItem }) {
  const cover = safeLibraryUrl(item.cover_url, true);
  return cover ? (
    <span
      className={styles.coverImage}
      role="img"
      aria-label={`غلاف ${item.title}`}
      style={{ backgroundImage: `url(${JSON.stringify(cover)})` }}
    />
  ) : (
    <span className={styles.generatedCover} aria-hidden="true">
      <small>{item.content_type}</small>
      <strong>{item.short_title || item.title}</strong>
    </span>
  );
}

function ScientificLibraryListContent({
  page,
  query,
  options,
  optionsWarning,
  deletedNotice = false,
}: {
  page: ScientificLibraryPage;
  query: ScientificLibraryQuery;
  options: ScientificLibraryOptions;
  optionsWarning?: string;
  deletedNotice?: boolean;
}) {
  const [rows, setRows] = useState(page.data);
  const [search, setSearch] = useState(query.search ?? "");
  const [contentType, setContentType] = useState(query.content_type ?? "");
  const [scientificField, setScientificField] = useState(
    query.scientific_field ?? "",
  );
  const [status, setStatus] = useState(query.status ?? "");
  const [sourceType, setSourceType] = useState(query.source_type ?? "");
  const [featured, setFeatured] = useState(query.is_featured ?? "");
  const [perPage, setPerPage] = useState(String(query.per_page));
  const [deleteTarget, setDeleteTarget] =
    useState<ScientificLibraryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = Boolean(
    query.search ||
    query.content_type ||
    query.scientific_field ||
    query.status ||
    query.source_type ||
    query.is_featured,
  );

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteScientificLibraryItem(deleteTarget.id);
      const remaining = rows.filter((item) => item.id !== deleteTarget.id);
      setRows(remaining);
      setDeleteTarget(null);
      const destination = scientificLibraryListHref(query, {
        page:
          remaining.length === 0 && page.meta.current_page > 1
            ? page.meta.current_page - 1
            : page.meta.current_page,
      });
      const join = destination.includes("?") ? "&" : "?";
      window.location.assign(`${destination}${join}notice=deleted`);
    } catch (reason) {
      setActionError(
        reason instanceof Error ? reason.message : "تعذر حذف المصنَّف.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className={styles.stack} dir="rtl" aria-label="إدارة المصنَّفات">
      {deletedNotice && (
        <div className={styles.successNotice} role="status">
          تم حذف المصنَّف وملفاته المرتبطة بنجاح.
        </div>
      )}
      {optionsWarning && (
        <div className={styles.warningNotice} role="status">
          {optionsWarning}
        </div>
      )}

      <section className={styles.metrics} aria-label="ملخص المكتبة العلمية">
        <article>
          <span>إجمالي المصنَّفات</span>
          <strong>{formatArabicNumber(page.meta.total)}</strong>
          <small>وفق الفلاتر الحالية</small>
        </article>
        <article>
          <span>المعروض الآن</span>
          <strong>{formatArabicNumber(rows.length)}</strong>
          <small>في الصفحة الحالية</small>
        </article>
        <article>
          <span>الصفحة</span>
          <strong>{formatArabicNumber(page.meta.current_page)}</strong>
          <small>من {formatArabicNumber(page.meta.last_page)}</small>
        </article>
      </section>

      <section className={styles.filterPanel} aria-labelledby="library-filters">
        <div className={styles.filterIntro}>
          <span>وصول سريع</span>
          <h2 id="library-filters">ابحث وصفِّ المكتبة</h2>
          <p>استخدم عنوان المصنَّف أو المؤلف، ثم ضيّق النتائج عند الحاجة.</p>
        </div>
        <form action="/dashboard/library" className={styles.filters}>
          <label className={styles.searchField}>
            <span>البحث</span>
            <input
              className="ui-input"
              name="search"
              value={search}
              placeholder="العنوان، المؤلف، الوصف أو الكلمات المفتاحية"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            <span>نوع المحتوى</span>
            <Select
              name="content_type"
              value={contentType}
              aria-label="نوع المحتوى"
              options={[
                { value: "", label: "كل أنواع المحتوى" },
                ...options.content_types,
              ]}
              onValueChange={setContentType}
            />
          </label>
          <label>
            <span>المجال العلمي</span>
            <Select
              name="scientific_field"
              value={scientificField}
              aria-label="المجال العلمي"
              options={[
                { value: "", label: "كل المجالات العلمية" },
                ...options.scientific_fields,
              ]}
              onValueChange={setScientificField}
            />
          </label>
          <label>
            <span>حالة النشر</span>
            <Select
              name="status"
              value={status}
              aria-label="حالة النشر"
              options={[
                { value: "", label: "كل الحالات" },
                ...options.statuses,
              ]}
              onValueChange={setStatus}
            />
          </label>
          <label>
            <span>نوع المصدر</span>
            <Select
              name="source_type"
              value={sourceType}
              aria-label="نوع المصدر"
              options={[
                { value: "", label: "كل المصادر" },
                ...options.source_types,
              ]}
              onValueChange={setSourceType}
            />
          </label>
          <label>
            <span>التمييز</span>
            <Select
              name="is_featured"
              value={featured}
              aria-label="المصنَّفات المميزة"
              options={[
                { value: "", label: "الكل" },
                { value: "1", label: "المميزة فقط" },
                { value: "0", label: "غير المميزة" },
              ]}
              onValueChange={setFeatured}
            />
          </label>
          <label>
            <span>عدد النتائج</span>
            <Select
              name="per_page"
              value={perPage}
              aria-label="عدد النتائج في الصفحة"
              options={[20, 40, 60, 100].map((value) => ({
                value: String(value),
                label: `${formatArabicNumber(value)} نتيجة`,
              }))}
              onValueChange={setPerPage}
            />
          </label>
          <div className={styles.filterActions}>
            <Button type="submit">تطبيق البحث والفلاتر</Button>
            {filtered && (
              <Link
                href="/dashboard/library"
                className="ui-button ui-button--secondary ui-focus"
              >
                مسح الفلاتر
              </Link>
            )}
          </div>
        </form>
      </section>

      {rows.length === 0 ? (
        <EmptyState
          title={filtered ? "لا توجد نتائج مطابقة" : "لا توجد مصنَّفات بعد"}
          description={
            filtered
              ? "جرّب تعديل عبارة البحث أو مسح بعض الفلاتر."
              : "ابدأ بإضافة أول مصنَّف موثّق إلى المكتبة العلمية."
          }
          action={
            <Link
              href={filtered ? "/dashboard/library" : "/dashboard/library/new"}
              className="ui-button ui-button--primary ui-focus"
            >
              {filtered ? "عرض كل المصنَّفات" : "إضافة أول مصنَّف"}
            </Link>
          }
        />
      ) : (
        <>
          <div className={styles.listHeading}>
            <div>
              <span>الفهرس الإداري</span>
              <h2>المصنَّفات المسجلة</h2>
            </div>
            <strong>{formatArabicNumber(page.meta.total)} مصنَّف</strong>
          </div>
          <div className={styles.itemGrid}>
            {rows.map((item) => {
              const publicationStatus = scientificLibraryStatusOf(item);
              return (
                <article className={styles.itemCard} key={item.id}>
                  <Cover item={item} />
                  <div className={styles.itemBody}>
                    <div className={styles.badgeRow}>
                      <span
                        className={`${styles.statusBadge} ${styles[`status_${publicationStatus}`] ?? ""}`}
                      >
                        {scientificLibraryStatusLabels[publicationStatus]}
                      </span>
                      {item.is_featured && (
                        <span className={styles.featuredBadge}>مميز</span>
                      )}
                    </div>
                    <small className={styles.itemType}>
                      {item.content_type}
                    </small>
                    <h3>{item.title}</h3>
                    <p>{item.author_name}</p>
                    <dl className={styles.cardMeta}>
                      <div>
                        <dt>المجال</dt>
                        <dd>{item.scientific_field}</dd>
                      </div>
                      <div>
                        <dt>الصفحات</dt>
                        <dd>{formatArabicNumber(item.pages_count)}</dd>
                      </div>
                      <div>
                        <dt>المصدر</dt>
                        <dd>
                          {optionLabel(options.source_types, item.source_type)}
                        </dd>
                      </div>
                    </dl>
                    <div className={styles.cardActions}>
                      <Link
                        href={`/dashboard/library/${item.id}`}
                        className="ui-button ui-button--primary ui-focus"
                      >
                        عرض
                      </Link>
                      <Link
                        href={`/dashboard/library/${item.id}/edit`}
                        className="ui-button ui-button--secondary ui-focus"
                      >
                        تعديل
                      </Link>
                      <Button
                        variant="danger"
                        onClick={() => {
                          setActionError(null);
                          setDeleteTarget(item);
                        }}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <nav className={styles.pagination} aria-label="صفحات المكتبة العلمية">
            <Link
              href={scientificLibraryListHref(query, {
                page: Math.max(1, page.meta.current_page - 1),
              })}
              aria-disabled={page.meta.current_page <= 1}
              tabIndex={page.meta.current_page <= 1 ? -1 : undefined}
              className={`ui-button ui-button--secondary ui-focus ${page.meta.current_page <= 1 ? styles.disabledLink : ""}`}
            >
              السابق
            </Link>
            <span aria-current="page">
              صفحة <strong>{formatArabicNumber(page.meta.current_page)}</strong>{" "}
              من {formatArabicNumber(page.meta.last_page)}
            </span>
            <Link
              href={scientificLibraryListHref(query, {
                page: Math.min(page.meta.last_page, page.meta.current_page + 1),
              })}
              aria-disabled={page.meta.current_page >= page.meta.last_page}
              tabIndex={
                page.meta.current_page >= page.meta.last_page ? -1 : undefined
              }
              className={`ui-button ui-button--secondary ui-focus ${page.meta.current_page >= page.meta.last_page ? styles.disabledLink : ""}`}
            >
              التالي
            </Link>
          </nav>
        </>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
        title="حذف المصنَّف نهائيًا"
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
        <div className={styles.dangerMessage}>
          <strong>{deleteTarget?.title}</strong>
          <p>
            سيُحذف السجل والملف والغلاف المرتبطان به نهائيًا. لا يمكن التراجع عن
            هذه العملية.
          </p>
          {actionError && <p role="alert">{actionError}</p>}
        </div>
      </Dialog>
    </section>
  );
}

export function ScientificLibraryListView(props: {
  page: ScientificLibraryPage;
  query: ScientificLibraryQuery;
  options: ScientificLibraryOptions;
  optionsWarning?: string;
  deletedNotice?: boolean;
}) {
  const { page, query } = props;
  const stateKey = JSON.stringify({
    query,
    total: page.meta.total,
    page: page.meta.current_page,
    rows: page.data.map((item) => [item.id, item.updated_at]),
  });

  return <ScientificLibraryListContent key={stateKey} {...props} />;
}
