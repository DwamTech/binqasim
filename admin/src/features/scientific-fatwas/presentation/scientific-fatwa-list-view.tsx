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
import { deleteScientificFatwa } from "../application/scientific-fatwas.client";
import { publicationLabel } from "../application/scientific-fatwas.form";
import type {
  ScientificFatwaItem,
  ScientificFatwaPage,
  ScientificFatwaQuery,
} from "../domain/scientific-fatwas.contracts";
import { scientificFatwaPageHref } from "../infrastructure/scientific-fatwas.query";
import styles from "./scientific-fatwas.module.css";

export function ScientificFatwaListView({
  paginator,
  query,
  deletedNotice = false,
}: {
  paginator: ScientificFatwaPage;
  query: ScientificFatwaQuery;
  deletedNotice?: boolean;
}) {
  const [rows, setRows] = useState(paginator.data);
  const [deleteTarget, setDeleteTarget] = useState<ScientificFatwaItem | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const filtered = Boolean(
    query.search ||
    query.category ||
    query.status ||
    query.is_featured ||
    query.is_listed,
  );

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteScientificFatwa(deleteTarget.id);
      setRows((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "تعذر حذف المسألة.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section dir="rtl" className={styles.stack}>
      {deletedNotice && (
        <div className={styles.notice} role="status">
          تم حذف المسألة بنجاح.
        </div>
      )}
      <section className={styles.metrics} aria-label="ملخص الفتاوى">
        <article>
          <span>إجمالي المسائل</span>
          <strong>{formatArabicNumber(paginator.stats.total)}</strong>
          <small>سجل داخل قاعدة البيانات</small>
        </article>
        <article>
          <span>المنشور</span>
          <strong>{formatArabicNumber(paginator.stats.published)}</strong>
          <small>متاح للزوار الآن</small>
        </article>
        <article>
          <span>المجدول</span>
          <strong>{formatArabicNumber(paginator.stats.scheduled)}</strong>
          <small>ينشر في موعد لاحق</small>
        </article>
        <article>
          <span>المسودات</span>
          <strong>{formatArabicNumber(paginator.stats.drafts)}</strong>
          <small>قيد المراجعة العلمية</small>
        </article>
      </section>

      <FilterPanel
        title="البحث والتصفية"
        description="ابحث داخل العنوان والسؤال والجواب والمراجع، ثم خصص النتائج."
      >
        <form action="/dashboard/scientific-fatwas" className={styles.filters}>
          <label>
            <span>بحث</span>
            <input
              className="ui-input"
              name="search"
              defaultValue={query.search}
              placeholder="عنوان، سؤال، كلمة مفتاحية..."
            />
          </label>
          <label>
            <span>التصنيف العلمي</span>
            <select
              className="ui-input"
              name="category"
              defaultValue={query.category ?? ""}
            >
              <option value="">كل التصنيفات</option>
              {paginator.filter_options.category_options.length > 0
                ? paginator.filter_options.category_options.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))
                : paginator.filter_options.categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
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
              <option value="published">منشور</option>
              <option value="scheduled">مجدول</option>
              <option value="draft">مسودة</option>
            </select>
          </label>
          <label>
            <span>الظهور في الرئيسية</span>
            <select
              className="ui-input"
              name="is_featured"
              defaultValue={query.is_featured ?? ""}
            >
              <option value="">الكل</option>
              <option value="1">المسألة المختارة</option>
              <option value="0">غير مختارة</option>
            </select>
          </label>
          <label>
            <span>الظهور في قائمة الفتاوى</span>
            <select
              className="ui-input"
              name="is_listed"
              defaultValue={query.is_listed ?? ""}
            >
              <option value="">الكل</option>
              <option value="1">ظاهرة في القائمة</option>
              <option value="0">بالرابط فقط</option>
            </select>
          </label>
          <label>
            <span>عدد النتائج</span>
            <select
              className="ui-input"
              name="per_page"
              defaultValue={String(query.per_page)}
            >
              <option value="10">١٠</option>
              <option value="20">٢٠</option>
              <option value="50">٥٠</option>
            </select>
          </label>
          <div className={styles.filterActions}>
            <Button type="submit">تطبيق الفلاتر</Button>
            {filtered && (
              <Link
                href="/dashboard/scientific-fatwas"
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
          title={filtered ? "لا توجد نتائج مطابقة" : "لا توجد مسائل بعد"}
          description={
            filtered
              ? "غيّر البحث أو الفلاتر وحاول مرة أخرى."
              : "أضف أول سؤال وجواب علمي ليظهر في الموقع."
          }
          action={
            <Link
              href="/dashboard/scientific-fatwas/new"
              className="ui-button ui-button--primary ui-focus"
            >
              إضافة مسألة
            </Link>
          }
        />
      ) : (
        <div className={styles.tableShell}>
          <div className={styles.tableHeading}>
            <div>
              <h2>سجل المسائل والأجوبة</h2>
              <p>كل الحقول التي يعتمد عليها الكرت وصفحة التفاصيل.</p>
            </div>
            <span className={styles.badge}>
              {formatArabicNumber(paginator.total)} مسألة
            </span>
          </div>
          <div
            className={`${styles.tableScroll} ui-responsive-table-wrap`}
            tabIndex={0}
          >
            <table className={`${styles.table} ui-responsive-table`}>
              <thead>
                <tr>
                  <th>المسألة</th>
                  <th>التصنيف العلمي</th>
                  <th>التاريخ</th>
                  <th>المراجع</th>
                  <th>الرئيسية</th>
                  <th>قائمة الفتاوى</th>
                  <th>النشر</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td data-label="المسألة">
                      <div className={styles.identity}>
                        <span>{item.title.slice(0, 1)}</span>
                        <div>
                          <strong>{item.title}</strong>
                          <small>{item.question}</small>
                          {item.managed_by_inbox && (
                            <small className={styles.inboxManagedLabel}>
                              مُدارة من صندوق الأسئلة
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td data-label="التصنيف العلمي">{item.category}</td>
                    <td data-label="التاريخ">{item.date_label}</td>
                    <td data-label="المراجع">
                      {formatArabicNumber(item.sources.length)}
                    </td>
                    <td data-label="الرئيسية">
                      <span
                        className={`${styles.badge} ${item.is_featured ? styles.featuredBadge : ""}`}
                      >
                        {item.is_featured ? "مختارة" : "عادية"}
                      </span>
                    </td>
                    <td data-label="قائمة الفتاوى">
                      <span
                        className={`${styles.badge} ${item.is_listed ? styles.featuredBadge : styles.draftBadge}`}
                      >
                        {item.is_listed ? "ظاهرة" : "بالرابط فقط"}
                      </span>
                    </td>
                    <td data-label="النشر">
                      <span
                        className={`${styles.badge} ${item.status === "draft" ? styles.draftBadge : item.status === "scheduled" ? styles.scheduledBadge : ""}`}
                      >
                        {publicationLabel(item)}
                      </span>
                    </td>
                    <td data-label="الإجراءات">
                      <div className={styles.actions}>
                        <Link
                          href={`/dashboard/scientific-fatwas/${item.id}`}
                          className="ui-button ui-button--secondary ui-focus"
                        >
                          عرض
                        </Link>
                        {item.managed_by_inbox && item.source_fatwa_id ? (
                          <Link
                            href={`/dashboard/scientific-fatwas/inbox/${item.source_fatwa_id}`}
                            className="ui-button ui-button--primary ui-focus"
                          >
                            إدارة من صندوق الأسئلة
                          </Link>
                        ) : (
                          <>
                            <Link
                              href={`/dashboard/scientific-fatwas/${item.id}/edit`}
                              className="ui-button ui-button--secondary ui-focus"
                            >
                              تعديل
                            </Link>
                            <Button
                              variant="danger"
                              onClick={() => {
                                setDeleteError(null);
                                setDeleteTarget(item);
                              }}
                            >
                              حذف
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className={styles.pagination} aria-label="صفحات الفتاوى">
            <Link
              href={scientificFatwaPageHref(
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
              href={scientificFatwaPageHref(
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
        title="حذف المسألة نهائيًا"
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
            سيُحذف السؤال والجواب والمراجع من مكتبة الموقع نهائيًا، ولن يتأثر
            صندوق الأسئلة الواردة القديم.
          </p>
          {deleteError && <p role="alert">{deleteError}</p>}
        </div>
      </Dialog>
    </section>
  );
}
