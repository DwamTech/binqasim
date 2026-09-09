"use client";

import Link from "next/link";
import { useState } from "react";

import { deleteDissertation } from "../application/dissertations.client";
import {
  dissertationPublicationStatusOf,
  type Dissertation,
  type DissertationPage,
  type DissertationQuery,
} from "../domain/dissertations.contracts";
import { dissertationPageHref } from "../infrastructure/dissertations.query";
import { formatArabicNumber, toArabicDigits } from "@/shared/lib/arabic-format";
import {
  Button,
  Dialog,
  EmptyState,
  FilterPanel,
} from "@/shared/components/ui";
import styles from "./dissertations.module.css";

export function DissertationsListView({
  paginator,
  query,
  deletedNotice = false,
}: {
  paginator: DissertationPage;
  query: DissertationQuery;
  deletedNotice?: boolean;
}) {
  const [rows, setRows] = useState(paginator.data);
  const [deleteTarget, setDeleteTarget] = useState<Dissertation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const filtered = Object.keys(query).some(
    (key) => !["page", "per_page"].includes(key),
  );
  const statusLabels = {
    draft: "مسودة",
    scheduled: "مجدول",
    published: "منشور",
  } as const;

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteDissertation(deleteTarget.id);
      setRows((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "تعذر حذف الرسالة العلمية.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section
      dir="rtl"
      aria-label="إدارة الرسائل العلمية"
      className={styles.stack}
    >
      {deletedNotice && (
        <div className={styles.notice} role="status">
          تم حذف الرسالة العلمية بنجاح.
        </div>
      )}

      <section className={styles.metrics} aria-label="ملخص الرسائل العلمية">
        <article>
          <span>إجمالي الرسائل</span>
          <strong>
            {formatArabicNumber(paginator.stats.total_dissertations)}
          </strong>
          <small>سجل داخل قاعدة البيانات</small>
        </article>
        <article>
          <span>المنشور للعامة</span>
          <strong>
            {formatArabicNumber(paginator.stats.published_dissertations)}
          </strong>
          <small>رسالة متاحة في الموقع</small>
        </article>
        <article>
          <span>المسودات</span>
          <strong>
            {formatArabicNumber(paginator.stats.draft_dissertations)}
          </strong>
          <small>رسالة غير منشورة</small>
        </article>
        <article>
          <span>المجدول للنشر</span>
          <strong>
            {formatArabicNumber(paginator.stats.scheduled_dissertations)}
          </strong>
          <small>يظهر تلقائيًا في موعده</small>
        </article>
      </section>

      <FilterPanel
        title="البحث والتصفية"
        description="ابحث بالعنوان أو الباحث، ثم ضيّق النتائج حسب بيانات الرسالة."
      >
        <form
          action="/dashboard/dissertations"
          className={styles.filters}
          aria-label="فلاتر الرسائل العلمية"
        >
          <label>
            <span>بحث</span>
            <input
              className="ui-input"
              name="search"
              defaultValue={query.search}
              placeholder="العنوان، الباحث، الجامعة..."
            />
          </label>
          <label>
            <span>السنة</span>
            <select
              className="ui-input"
              name="year"
              defaultValue={query.year ?? ""}
            >
              <option value="">كل السنوات</option>
              {paginator.filter_options.years.map((year) => (
                <option key={year} value={year}>
                  {toArabicDigits(year)}هـ
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>الجامعة</span>
            <select
              className="ui-input"
              name="university"
              defaultValue={query.university ?? ""}
            >
              <option value="">كل الجامعات</option>
              {paginator.filter_options.universities.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>التخصص</span>
            <select
              className="ui-input"
              name="specialization"
              defaultValue={query.specialization ?? ""}
            >
              <option value="">كل التخصصات</option>
              {paginator.filter_options.specializations.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>نوع المشاركة</span>
            <select
              className="ui-input"
              name="participation_type"
              defaultValue={query.participation_type ?? ""}
            >
              <option value="">كل المشاركات</option>
              {paginator.filter_options.participation_types.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>الدرجة العلمية</span>
            <select
              className="ui-input"
              name="degree"
              defaultValue={query.degree ?? ""}
            >
              <option value="">كل الدرجات</option>
              {paginator.filter_options.degrees.map((value) => (
                <option key={value} value={value}>
                  {value}
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
          <div className={styles.filterActions}>
            <Button type="submit">تطبيق الفلاتر</Button>
            {filtered && (
              <Link
                href="/dashboard/dissertations"
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
          title={filtered ? "لا توجد نتائج مطابقة" : "لا توجد رسائل بعد"}
          description={
            filtered
              ? "جرّب تغيير الفلاتر أو مسحها."
              : "ابدأ بإضافة أول رسالة علمية."
          }
          action={
            <Link
              href="/dashboard/dissertations/new"
              className="ui-button ui-button--primary ui-focus"
            >
              إضافة رسالة علمية
            </Link>
          }
        />
      ) : (
        <div className={styles.tableShell}>
          <div className={styles.tableHeading}>
            <div>
              <h2>سجل الرسائل العلمية</h2>
              <p>البيانات الأساسية وحالة النشر والإجراءات في مكان واحد.</p>
            </div>
            <span className={styles.badge}>
              {formatArabicNumber(paginator.total)} رسالة
            </span>
          </div>
          <div
            className={`${styles.tableScroll} ui-responsive-table-wrap`}
            tabIndex={0}
          >
            <table className={`${styles.table} ui-responsive-table`}>
              <thead>
                <tr>
                  <th scope="col">الرسالة والباحث</th>
                  <th scope="col">الجامعة</th>
                  <th scope="col">السنة</th>
                  <th scope="col">التخصص</th>
                  <th scope="col">المشاركة</th>
                  <th scope="col">الدرجة</th>
                  <th scope="col">النشر</th>
                  <th scope="col">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
                  const publicationStatus =
                    dissertationPublicationStatusOf(item);

                  return (
                    <tr key={item.id}>
                      <td data-label="الرسالة والباحث">
                        <div className={styles.identity}>
                          <span
                            className={styles.identityMark}
                            aria-hidden="true"
                          >
                            {item.title.slice(0, 1)}
                          </span>
                          <div>
                            <strong>{item.title}</strong>
                            <small>
                              {item.researcher_name} · DIS-
                              {toArabicDigits(item.id.padStart(4, "0"))}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td data-label="الجامعة">
                        {item.university || "غير محدد"}
                        {item.college && <small> — {item.college}</small>}
                      </td>
                      <td data-label="السنة">
                        {item.year
                          ? `${toArabicDigits(item.year)}هـ`
                          : "غير محدد"}
                      </td>
                      <td data-label="التخصص">
                        {item.specialization || "غير محدد"}
                      </td>
                      <td data-label="المشاركة">
                        {item.participation_type || "غير محدد"}
                      </td>
                      <td data-label="الدرجة">{item.degree || "غير محدد"}</td>
                      <td data-label="النشر">
                        <span
                          className={`${styles.badge} ${publicationStatus === "draft" ? styles.draftBadge : publicationStatus === "scheduled" ? styles.scheduledBadge : ""}`}
                        >
                          {statusLabels[publicationStatus]}
                        </span>
                      </td>
                      <td data-label="الإجراءات">
                        <div className={styles.actions}>
                          <Link
                            href={`/dashboard/dissertations/${item.id}`}
                            className="ui-button ui-button--secondary ui-focus"
                          >
                            عرض
                          </Link>
                          <Link
                            href={`/dashboard/dissertations/${item.id}/edit`}
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <nav className={styles.pagination} aria-label="صفحات الرسائل">
            <Link
              href={dissertationPageHref(
                query,
                Math.max(1, paginator.current_page - 1),
              )}
              aria-disabled={paginator.current_page <= 1}
              tabIndex={paginator.current_page <= 1 ? -1 : undefined}
              className={`ui-button ui-button--secondary ui-focus ${paginator.current_page <= 1 ? styles.disabledLink : ""}`}
            >
              السابق
            </Link>
            <span aria-current="page">
              صفحة {formatArabicNumber(paginator.current_page)} من{" "}
              {formatArabicNumber(paginator.last_page)}
            </span>
            <Link
              href={dissertationPageHref(
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
        title="حذف الرسالة العلمية نهائيًا"
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
          <p>سيُحذف السجل وملفه المرفوع نهائيًا.</p>
          {deleteError && <p role="alert">{deleteError}</p>}
        </div>
      </Dialog>
    </section>
  );
}
