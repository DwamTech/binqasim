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
import { deleteListeningSession } from "../application/listening.client";
import type {
  ListeningSession,
  ListeningSessionPage,
  ListeningSessionQuery,
} from "../domain/listening.contracts";
import { listeningSessionPageHref } from "../infrastructure/listening.query";
import styles from "./listening.module.css";

export function ListeningSessionsListView({
  paginator,
  query,
  deletedNotice = false,
}: {
  paginator: ListeningSessionPage;
  query: ListeningSessionQuery;
  deletedNotice?: boolean;
}) {
  const [rows, setRows] = useState(paginator.data);
  const [deleteTarget, setDeleteTarget] = useState<ListeningSession | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const filtered = Boolean(
    query.search || query.series_id || query.is_published,
  );

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteListeningSession(deleteTarget.id);
      setRows((current) =>
        current.filter((session) => session.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "تعذر حذف المجلس.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section
      dir="rtl"
      aria-label="إدارة المجالس والتسجيلات الصوتية"
      className={styles.stack}
    >
      {deletedNotice && (
        <div className={styles.notice} role="status">
          تم حذف المجلس بنجاح.
        </div>
      )}
      <section
        className={styles.metrics}
        aria-label="ملخص المجالس والتسجيلات الصوتية"
      >
        <article>
          <span>إجمالي المجالس</span>
          <strong>{formatArabicNumber(paginator.stats.total)}</strong>
          <small>مجلس داخل قاعدة البيانات</small>
        </article>
        <article>
          <span>المفعّل للنشر</span>
          <strong>{formatArabicNumber(paginator.stats.published)}</strong>
          <small>مجلس تم تفعيل نشره</small>
        </article>
        <article>
          <span>المسودات</span>
          <strong>{formatArabicNumber(paginator.stats.drafts)}</strong>
          <small>مجلس غير منشور</small>
        </article>
      </section>

      <FilterPanel
        title="البحث في المجالس"
        description="ابحث بالعنوان أو الوصف، ثم اختر السلسلة وحالة النشر."
      >
        <form action="/dashboard/listening/sessions" className={styles.filters}>
          <label>
            <span>بحث</span>
            <input
              className="ui-input"
              name="search"
              defaultValue={query.search}
              placeholder="عنوان المجلس أو الوصف..."
            />
          </label>
          <label>
            <span>السلسلة</span>
            <select
              className="ui-input"
              name="series_id"
              defaultValue={query.series_id ?? ""}
            >
              <option value="">كل السلاسل</option>
              {paginator.filter_options.series.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.short_title}
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
                href="/dashboard/listening/sessions"
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
          title={filtered ? "لا توجد نتائج مطابقة" : "لا توجد مجالس بعد"}
          description={
            filtered
              ? "جرّب تغيير الفلاتر أو مسحها."
              : "ابدأ بإضافة أول مجلس إلى إحدى السلاسل."
          }
          action={
            <Link
              href="/dashboard/listening/sessions/new"
              className="ui-button ui-button--primary ui-focus"
            >
              إضافة مجلس
            </Link>
          }
        />
      ) : (
        <div className={styles.tableShell}>
          <div className={styles.tableHeading}>
            <div>
              <h2>المجالس والتسجيلات الصوتية</h2>
              <p>ترتيب المجالس والتسجيل وحالة النشر في مكان واحد.</p>
            </div>
            <span className={styles.badge}>
              {formatArabicNumber(paginator.total)} مجلس
            </span>
          </div>
          <div
            className={`${styles.tableScroll} ui-responsive-table-wrap`}
            tabIndex={0}
          >
            <table className={`${styles.table} ui-responsive-table`}>
              <thead>
                <tr>
                  <th scope="col">المجلس</th>
                  <th scope="col">السلسلة</th>
                  <th scope="col">الترتيب</th>
                  <th scope="col">التاريخ</th>
                  <th scope="col">المدة</th>
                  <th scope="col">التسجيل</th>
                  <th scope="col">النشر</th>
                  <th scope="col">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((session) => (
                  <tr key={session.id}>
                    <td data-label="المجلس">
                      <div className={styles.identity}>
                        <span
                          className={styles.identityMark}
                          aria-hidden="true"
                        >
                          {formatArabicNumber(session.sequence_number)}
                        </span>
                        <div>
                          <strong>{session.title}</strong>
                          <small dir="ltr">
                            {session.slug ?? "يُنشأ تلقائيًا"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td data-label="السلسلة">
                      {session.series?.short_title ?? "—"}
                    </td>
                    <td data-label="الترتيب">
                      {formatArabicNumber(session.sequence_number)}
                    </td>
                    <td data-label="التاريخ">{session.date_label}</td>
                    <td data-label="المدة">
                      {formatArabicNumber(session.duration_minutes)} دقيقة
                    </td>
                    <td data-label="التسجيل">
                      {session.audio_source_type ? "مضاف" : "بدون تسجيل"}
                    </td>
                    <td data-label="النشر">
                      <span
                        className={`${styles.badge} ${session.is_published ? "" : styles.draftBadge}`}
                      >
                        {session.is_published ? "منشور" : "مسودة"}
                      </span>
                    </td>
                    <td data-label="الإجراءات">
                      <div className={styles.actions}>
                        <Link
                          href={`/dashboard/listening/sessions/${session.id}`}
                          className="ui-button ui-button--secondary ui-focus"
                        >
                          عرض
                        </Link>
                        <Link
                          href={`/dashboard/listening/sessions/${session.id}/edit`}
                          className="ui-button ui-button--secondary ui-focus"
                        >
                          تعديل
                        </Link>
                        <Button
                          variant="danger"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(session);
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
          <nav className={styles.pagination} aria-label="صفحات المجالس">
            <Link
              href={listeningSessionPageHref(
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
              href={listeningSessionPageHref(
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
        title="حذف المجلس نهائيًا"
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
          <p>سيُحذف المجلس وملف التسجيل المرفوع نهائيًا.</p>
          {deleteError && <p role="alert">{deleteError}</p>}
        </div>
      </Dialog>
    </section>
  );
}
