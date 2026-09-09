"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Button,
  Dialog,
  EmptyState,
  FilterPanel,
  Select,
} from "@/shared/components/ui";
import {
  dashboardCopy,
  withoutArabicDefiniteArticle,
} from "@/core/config/dashboard-copy";
import { formatArabicNumber, toArabicDigits } from "@/shared/lib/arabic-format";
import type {
  AdminBook,
  AdminBooksPaginator,
  AdminBooksQuery,
  BookSeries,
} from "../domain/books.contracts";
import { deleteBook } from "../application/books.client";
import { booksListHref } from "./books-route.helpers";
import styles from "./books.module.css";
import type { LibraryAreaSlug } from "../domain/library-areas";

const typeLabels = { single: "كتاب مستقل", part: "جزء من سلسلة" } as const;
const sourceLabels = {
  file: "ملف مرفوع",
  link: "رابط خارجي",
  embed: "محتوى مضمّن",
} as const;

function BookMark({ title }: { title: string }) {
  return (
    <span className={styles.bookMark} aria-hidden="true">
      {title.trim().slice(0, 1) || "ك"}
    </span>
  );
}

export function BooksListView({
  paginator,
  query,
  series = [],
  sections = [],
  deletedNotice = false,
  basePath = "/dashboard/books",
  area,
  publicMetadataColumns = false,
}: {
  paginator: AdminBooksPaginator;
  query: AdminBooksQuery;
  series?: BookSeries[];
  sections?: Array<{ id: string; name: string }>;
  deletedNotice?: boolean;
  basePath?: string;
  area?: LibraryAreaSlug;
  publicMetadataColumns?: boolean;
}) {
  const [rows, setRows] = useState(paginator.data);
  const [sectionId, setSectionId] = useState(
    query.section_id === undefined ? "" : String(query.section_id),
  );
  const [seriesId, setSeriesId] = useState(
    query.series_id === undefined ? "" : String(query.series_id),
  );
  const [type, setType] = useState<string>(query.type ?? "");
  const [deleteTarget, setDeleteTarget] = useState<AdminBook | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const filtered =
    query.section_id !== undefined ||
    query.series_id !== undefined ||
    query.type !== undefined;
  const totalPages = Math.max(
    1,
    Math.ceil(paginator.total / paginator.per_page),
  );

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteBook(String(deleteTarget.id), area);
      setRows((current) =>
        current.filter((book) => book.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (reason) {
      setActionError(
        reason instanceof Error
          ? reason.message
          : `تعذر حذف ${dashboardCopy.modules.books.singular}.`,
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section
      dir="rtl"
      aria-label={dashboardCopy.modules.books.navigation}
      className={styles.stack}
    >
      {deletedNotice && (
        <div className={styles.notice} role="status">
          تم حذف {dashboardCopy.modules.books.singular} بنجاح.
        </div>
      )}
      <section className={styles.metrics} aria-label="ملخص الكتب">
        <article>
          <span>إجمالي الكتب</span>
          <strong>{formatArabicNumber(paginator.total)}</strong>
          <small>عنصر داخل المكتبة</small>
        </article>
        <article>
          <span>الصفحة الحالية</span>
          <strong>{formatArabicNumber(paginator.current_page)}</strong>
          <small>من {formatArabicNumber(totalPages)} صفحات</small>
        </article>
        <article>
          <span>المعروض الآن</span>
          <strong>{formatArabicNumber(rows.length)}</strong>
          <small>كتاب في الجدول</small>
        </article>
      </section>

      <FilterPanel
        title="تصفية مكتبة الكتب"
        description="اختر القسم أو السلسلة أو النوع للوصول إلى الكتاب المطلوب بسرعة."
      >
        <form
          action={basePath}
          className={styles.filters}
          aria-label="فلاتر الكتب"
        >
          <label>
            <span>القسم</span>
            <Select
              name="section_id"
              value={sectionId}
              autoSubmit
              aria-label="قسم الكتاب"
              options={[
                { value: "", label: "كل الأقسام" },
                ...sections.map((section) => ({
                  value: String(section.id),
                  label: section.name,
                })),
              ]}
              onValueChange={setSectionId}
            />
          </label>
          <label>
            <span>السلسلة</span>
            <Select
              name="series_id"
              value={seriesId}
              autoSubmit
              aria-label="سلسلة الكتاب"
              options={[
                { value: "", label: "كل السلاسل" },
                ...series.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                })),
              ]}
              onValueChange={setSeriesId}
            />
          </label>
          <label>
            <span>نوع الكتاب</span>
            <Select
              name="type"
              value={type}
              autoSubmit
              aria-label="نوع الكتاب"
              options={[
                { value: "", label: "كل الأنواع" },
                { value: "single", label: "كتاب مستقل" },
                { value: "part", label: "جزء من سلسلة" },
              ]}
              onValueChange={setType}
            />
          </label>
        </form>
      </FilterPanel>

      {rows.length === 0 ? (
        <EmptyState
          title={
            filtered
              ? "لا توجد نتائج مطابقة"
              : `لا توجد ${withoutArabicDefiniteArticle(
                  dashboardCopy.modules.books.plural,
                )} بعد`
          }
          description={
            filtered
              ? "جرّب تغيير القسم أو السلسلة أو نوع الكتاب."
              : "ابدأ بإضافة أول كتاب إلى المكتبة."
          }
          action={
            <Link
              href={`${basePath}/new`}
              className="ui-button ui-button--primary ui-focus"
            >
              {dashboardCopy.modules.books.pages.create}
            </Link>
          }
        />
      ) : (
        <div className={styles.tableShell}>
          <div className={styles.tableHeading}>
            <div>
              <h2>قائمة الكتب</h2>
              <p>كل البيانات الأساسية والإجراءات في مكان واحد.</p>
            </div>
            <span>{formatArabicNumber(paginator.total)} كتاب</span>
          </div>
          <div
            className={`${styles.tableScroll} ui-responsive-table-wrap`}
            tabIndex={0}
          >
            <table className={`${styles.table} ui-responsive-table`}>
              <thead>
                <tr>
                  <th scope="col">الكتاب</th>
                  <th scope="col">التصنيف</th>
                  <th scope="col">المصدر</th>
                  <th scope="col">القسم</th>
                  <th scope="col">المؤلف</th>
                  {publicMetadataColumns && <th scope="col">الصفحات</th>}
                  {publicMetadataColumns && <th scope="col">النشر</th>}
                  <th scope="col">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((book) => (
                  <tr key={book.id}>
                    <td data-label="الكتاب">
                      <div className={styles.bookIdentity}>
                        <BookMark title={book.title} />
                        <div>
                          <strong>{book.title}</strong>
                          <small>
                            BOOK-
                            {toArabicDigits(String(book.id).padStart(4, "0"))}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td data-label="التصنيف">
                      <span
                        className={`${styles.badge} ${book.type === "part" ? styles.badgePart : ""}`}
                      >
                        {typeLabels[book.type]}
                      </span>
                    </td>
                    <td data-label="المصدر">
                      {book.source_type
                        ? sourceLabels[book.source_type]
                        : "غير محدد"}
                    </td>
                    <td data-label="القسم">
                      {book.section?.name ?? "بدون قسم"}
                    </td>
                    <td data-label="المؤلف">{book.author_name ?? "—"}</td>
                    {publicMetadataColumns && (
                      <td data-label="الصفحات">
                        {book.pages_count
                          ? formatArabicNumber(book.pages_count)
                          : "—"}
                      </td>
                    )}
                    {publicMetadataColumns && (
                      <td data-label="النشر">
                        <span
                          className={`${styles.badge} ${book.is_published ? "" : styles.badgePart}`}
                        >
                          {book.is_published ? "منشور" : "غير منشور"}
                        </span>
                      </td>
                    )}
                    <td data-label="الإجراءات">
                      <div className={styles.actions}>
                        <Link
                          href={`${basePath}/${book.id}`}
                          className="ui-button ui-button--secondary ui-focus"
                        >
                          عرض
                        </Link>
                        <Link
                          href={`${basePath}/${book.id}/edit`}
                          className="ui-button ui-button--secondary ui-focus"
                        >
                          تعديل
                        </Link>
                        <Button
                          variant="danger"
                          onClick={() => {
                            setActionError(null);
                            setDeleteTarget(book);
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
          <nav className={styles.pagination} aria-label="صفحات الكتب">
            <Link
              aria-disabled={paginator.current_page <= 1}
              tabIndex={paginator.current_page <= 1 ? -1 : undefined}
              href={booksListHref(
                query,
                Math.max(1, paginator.current_page - 1),
                basePath,
              )}
              className={`ui-button ui-button--secondary ui-focus ${paginator.current_page <= 1 ? styles.disabledLink : ""}`}
            >
              السابق
            </Link>
            <span aria-current="page">
              صفحة <strong>{formatArabicNumber(paginator.current_page)}</strong>{" "}
              من {formatArabicNumber(totalPages)}
            </span>
            <Link
              aria-disabled={paginator.current_page >= totalPages}
              tabIndex={paginator.current_page >= totalPages ? -1 : undefined}
              href={booksListHref(
                query,
                Math.min(totalPages, paginator.current_page + 1),
                basePath,
              )}
              className={`ui-button ui-button--secondary ui-focus ${paginator.current_page >= totalPages ? styles.disabledLink : ""}`}
            >
              التالي
            </Link>
          </nav>
        </div>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
        title={`حذف ${dashboardCopy.modules.books.singular} نهائيًا`}
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
            الحذف في النظام الحالي نهائي وليس Soft Delete. تأكد أن هذا هو الكتاب
            المقصود قبل المتابعة.
          </p>
          {actionError && <p role="alert">{actionError}</p>}
        </div>
      </Dialog>
    </section>
  );
}
