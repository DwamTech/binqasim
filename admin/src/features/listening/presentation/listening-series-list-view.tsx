"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Button,
  Dialog,
  EmptyState,
  FilterPanel,
} from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import { deleteListeningSeries } from "../application/listening.client";
import type {
  ListeningSeries,
  ListeningSeriesPage,
  ListeningSeriesQuery,
} from "../domain/listening.contracts";
import { listeningSeriesPageHref } from "../infrastructure/listening.query";
import styles from "./listening.module.css";

const visualLabels: Record<string, string> = {
  gold: "ذهبي",
  sage: "أخضر هادئ",
  clay: "طيني",
  bronze: "برونزي",
  slate: "أردوازي",
};

export function ListeningSeriesListView({
  paginator,
  query,
  deletedNotice = false,
}: {
  paginator: ListeningSeriesPage;
  query: ListeningSeriesQuery;
  deletedNotice?: boolean;
}) {
  const [rows, setRows] = useState(paginator.data);
  const [deleteTarget, setDeleteTarget] = useState<ListeningSeries | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const filtered = Boolean(
    query.search || query.category || query.is_published,
  );

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteListeningSeries(deleteTarget.id);
      setRows((current) =>
        current.filter((series) => series.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "تعذر حذف السلسلة.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section dir="rtl" aria-label="إدارة السلاسل" className={styles.stack}>
      {deletedNotice && (
        <div className={styles.notice} role="status">
          تم حذف السلسلة بنجاح.
        </div>
      )}

      <section className={styles.metrics} aria-label="ملخص السلاسل">
        <article>
          <span>إجمالي السلاسل</span>
          <strong>{formatArabicNumber(paginator.stats.total)}</strong>
          <small>سلسلة داخل قاعدة البيانات</small>
        </article>
        <article>
          <span>المفعّل للنشر</span>
          <strong>{formatArabicNumber(paginator.stats.published)}</strong>
          <small>سلسلة مفعّلة للنشر</small>
        </article>
        <article>
          <span>المسودات</span>
          <strong>{formatArabicNumber(paginator.stats.drafts)}</strong>
          <small>سلسلة قيد التجهيز</small>
        </article>
      </section>

      <FilterPanel
        title="البحث والتصفية"
        description="ابحث في السلاسل ثم صفّ النتائج حسب التصنيف أو حالة النشر."
      >
        <form action="/dashboard/listening" className={styles.filters}>
          <label>
            <span>بحث</span>
            <input
              className="ui-input"
              name="search"
              defaultValue={query.search}
              placeholder="العنوان أو الوصف أو الرابط..."
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
              {paginator.filter_options.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>حالة النشر</span>
            <select
              className="ui-input"
              name="is_published"
              defaultValue={query.is_published ?? ""}
            >
              <option value="">كل الحالات</option>
              <option value="1">منشور</option>
              <option value="0">مسودة</option>
            </select>
          </label>
          <div className={styles.filterActions}>
            <Button type="submit">تطبيق الفلاتر</Button>
            {filtered && (
              <Link
                href="/dashboard/listening"
                className="ui-button ui-button--secondary ui-focus"
              >
                مسح الفلاتر
              </Link>
            )}
          </div>
        </form>
      </FilterPanel>

      {rows.length === 0 ? (
        <EmptyState
          title={filtered ? "لا توجد نتائج مطابقة" : "لا توجد سلاسل بعد"}
          description={
            filtered
              ? "جرّب تغيير الفلاتر أو مسحها."
              : "ابدأ بإضافة أول سلسلة لمجالس السماع."
          }
          action={
            <Link
              href="/dashboard/listening/new"
              className="ui-button ui-button--primary ui-focus"
            >
              إضافة سلسلة
            </Link>
          }
        />
      ) : (
        <div className={styles.tableShell}>
          <div className={styles.tableHeading}>
            <div>
              <h2>السلاسل</h2>
              <p>الهوية والكتاب وعدد المجالس وحالة النشر في سجل واحد.</p>
            </div>
            <span className={styles.badge}>
              {formatArabicNumber(paginator.total)} سلسلة
            </span>
          </div>
          <div
            className={`${styles.tableScroll} ui-responsive-table-wrap`}
            tabIndex={0}
          >
            <table className={`${styles.table} ui-responsive-table`}>
              <thead>
                <tr>
                  <th scope="col">السلسلة</th>
                  <th scope="col">التصنيف</th>
                  <th scope="col">الفترة</th>
                  <th scope="col">المظهر</th>
                  <th scope="col">المجالس</th>
                  <th scope="col">الكتاب</th>
                  <th scope="col">النشر</th>
                  <th scope="col">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((series) => (
                  <tr key={series.id}>
                    <td data-label="السلسلة">
                      <div className={styles.identity}>
                        <span
                          className={styles.identityMark}
                          aria-hidden="true"
                        >
                          {series.short_title.slice(0, 1)}
                        </span>
                        <div>
                          <strong>{series.title}</strong>
                          <small dir="ltr">
                            {series.slug ?? "يُنشأ تلقائيًا"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td data-label="التصنيف">{series.category}</td>
                    <td data-label="الفترة">{series.period_label}</td>
                    <td data-label="المظهر">
                      {series.visual_variant
                        ? (visualLabels[series.visual_variant] ??
                          series.visual_variant)
                        : "افتراضي"}
                    </td>
                    <td data-label="المجالس">
                      <strong>
                        {formatArabicNumber(series.sessions_count)}
                      </strong>
                      <small>
                        {formatArabicNumber(series.published_sessions_count)}{" "}
                        منشور
                      </small>
                    </td>
                    <td data-label="الكتاب">
                      {series.book_source_type ? "مضاف" : "بدون ملف"}
                    </td>
                    <td data-label="النشر">
                      <span
                        className={`${styles.badge} ${series.is_published ? "" : styles.draftBadge}`}
                      >
                        {series.is_published ? "منشور" : "مسودة"}
                      </span>
                    </td>
                    <td data-label="الإجراءات">
                      <div className={styles.actions}>
                        <Link
                          href={`/dashboard/listening/${series.id}`}
                          className="ui-button ui-button--secondary ui-focus"
                        >
                          عرض
                        </Link>
                        <Link
                          href={`/dashboard/listening/${series.id}/edit`}
                          className="ui-button ui-button--secondary ui-focus"
                        >
                          تعديل
                        </Link>
                        <Button
                          variant="danger"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(series);
                          }}
                        >
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className={styles.pagination} aria-label="صفحات السلاسل">
            <Link
              href={listeningSeriesPageHref(
                query,
                Math.max(1, paginator.current_page - 1),
              )}
              aria-disabled={paginator.current_page <= 1}
              tabIndex={paginator.current_page <= 1 ? -1 : undefined}
              className={`ui-button ui-button--secondary ui-focus ${paginator.current_page <= 1 ? styles.disabledLink : ""}`}
            >
              السابق
            </Link>
            <span>
              صفحة {formatArabicNumber(paginator.current_page)} من{" "}
              {formatArabicNumber(paginator.last_page)}
            </span>
            <Link
              href={listeningSeriesPageHref(
                query,
                Math.min(paginator.last_page, paginator.current_page + 1),
              )}
              aria-disabled={paginator.current_page >= paginator.last_page}
              tabIndex={
                paginator.current_page >= paginator.last_page ? -1 : undefined
              }
              className={`ui-button ui-button--secondary ui-focus ${paginator.current_page >= paginator.last_page ? styles.disabledLink : ""}`}
            >
              التالي
            </Link>
          </nav>
        </div>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
        title="حذف السلسلة نهائيًا"
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
            سيُحذف سجل السلسلة وكل مجالسها وملفات الكتاب والصوت المرتبطة بها
            نهائيًا.
          </p>
          {deleteError && <p role="alert">{deleteError}</p>}
        </div>
      </Dialog>
    </section>
  );
}
