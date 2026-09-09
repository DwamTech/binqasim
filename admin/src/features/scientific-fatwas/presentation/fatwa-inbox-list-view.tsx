import Link from "next/link";

import { EmptyState, FilterPanel } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import type {
  FatwaInboxPage,
  FatwaInboxQuery,
  FatwaInboxStatus,
  FatwaInboxSummary,
  FatwaVisibility,
} from "../domain/fatwa-inbox.contracts";
import { fatwaInboxPageHref } from "../infrastructure/fatwa-inbox.query";
import styles from "./scientific-fatwas.module.css";

const statusLabels: Record<FatwaInboxStatus, string> = {
  new: "جديد",
  answered: "تم الرد",
  archived: "مؤرشف",
};

const visibilityLabels: Record<FatwaVisibility, string> = {
  public: "عام",
  private: "خاص بالبريد",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function FatwaInboxListView({
  paginator,
  query,
  summary,
}: {
  paginator: FatwaInboxPage;
  query: FatwaInboxQuery;
  summary: FatwaInboxSummary | null;
}) {
  const filtered = Boolean(query.search || query.status || query.visibility);
  const metrics = summary ?? {
    total: paginator.total,
    new: paginator.data.filter((item) => item.status === "new").length,
    answered: paginator.data.filter((item) => item.status === "answered")
      .length,
    archived: paginator.data.filter((item) => item.status === "archived")
      .length,
    public: paginator.data.filter((item) => item.visibility === "public")
      .length,
    private: paginator.data.filter((item) => item.visibility === "private")
      .length,
  };

  return (
    <section dir="rtl" className={styles.stack}>
      <section className={styles.metrics} aria-label="ملخص صندوق الأسئلة">
        <article>
          <span>إجمالي الأسئلة</span>
          <strong>{formatArabicNumber(metrics.total)}</strong>
          <small>كل الأسئلة المستلمة</small>
        </article>
        <article>
          <span>بانتظار الرد</span>
          <strong>{formatArabicNumber(metrics.new)}</strong>
          <small>تظهر أولًا للمراجعة</small>
        </article>
        <article>
          <span>تم الرد</span>
          <strong>{formatArabicNumber(metrics.answered)}</strong>
          <small>{formatArabicNumber(metrics.public)} إجابة عامة</small>
        </article>
        <article>
          <span>المؤرشفة</span>
          <strong>{formatArabicNumber(metrics.archived)}</strong>
          <small>يمكن استعادتها عند الحاجة</small>
        </article>
      </section>

      <FilterPanel
        title="البحث في الأسئلة الواردة"
        description="ابحث برقم المرجع أو اسم السائل أو بريده أو نص السؤال، ثم خصص النتائج بالحالة."
      >
        <form
          action="/dashboard/scientific-fatwas/inbox"
          className={styles.inboxFilters}
        >
          <label>
            <span>بحث</span>
            <input
              className="ui-input"
              name="search"
              defaultValue={query.search}
              placeholder="رقم المرجع، الاسم، البريد، السؤال..."
            />
          </label>
          <label>
            <span>حالة السؤال</span>
            <select
              className="ui-input"
              name="status"
              defaultValue={query.status ?? ""}
            >
              <option value="">كل الحالات</option>
              <option value="new">جديد</option>
              <option value="answered">تم الرد</option>
              <option value="archived">مؤرشف</option>
            </select>
          </label>
          <label>
            <span>نوع الإجابة</span>
            <select
              className="ui-input"
              name="visibility"
              defaultValue={query.visibility ?? ""}
            >
              <option value="">الكل</option>
              <option value="public">عامة</option>
              <option value="private">خاصة بالبريد</option>
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
            <button
              className="ui-button ui-button--primary ui-focus"
              type="submit"
            >
              تطبيق الفلاتر
            </button>
            {filtered && (
              <Link
                href="/dashboard/scientific-fatwas/inbox"
                className="ui-button ui-button--secondary ui-focus"
              >
                مسح الفلاتر
              </Link>
            )}
          </div>
        </form>
      </FilterPanel>

      {paginator.data.length === 0 ? (
        <EmptyState
          title={filtered ? "لا توجد أسئلة مطابقة" : "صندوق الأسئلة فارغ"}
          description={
            filtered
              ? "غيّر البحث أو الفلاتر وحاول مرة أخرى."
              : "ستظهر هنا الأسئلة المرسلة من نموذج الفتاوى في الموقع."
          }
        />
      ) : (
        <div className={styles.tableShell}>
          <div className={styles.tableHeading}>
            <div>
              <h2>الأسئلة الواردة</h2>
              <p>الأسئلة الجديدة تظهر أولًا لتسريع المراجعة والرد.</p>
            </div>
            <span className={styles.badge}>
              {formatArabicNumber(paginator.total)} سؤال
            </span>
          </div>
          <div
            className={`${styles.tableScroll} ui-responsive-table-wrap`}
            tabIndex={0}
          >
            <table
              className={`${styles.table} ${styles.inboxTable} ui-responsive-table`}
            >
              <thead>
                <tr>
                  <th>السؤال</th>
                  <th>السائل</th>
                  <th>الحالة</th>
                  <th>نوع الإجابة</th>
                  <th>تاريخ الاستلام</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {paginator.data.map((item) => (
                  <tr key={item.id}>
                    <td data-label="السؤال">
                      <div className={styles.inboxIdentity}>
                        <strong>
                          {item.question_title ?? item.reference_number}
                        </strong>
                        <small>{item.question_preview}</small>
                        <span>{item.reference_number}</span>
                      </div>
                    </td>
                    <td data-label="السائل">
                      <div className={styles.inboxQuestioner}>
                        <strong>{item.name || "غير مذكور"}</strong>
                        <small dir="ltr">{item.email}</small>
                      </div>
                    </td>
                    <td data-label="الحالة">
                      <span
                        className={`${styles.badge} ${
                          item.status === "new"
                            ? styles.scheduledBadge
                            : item.status === "archived"
                              ? styles.draftBadge
                              : ""
                        }`}
                      >
                        {item.status_label || statusLabels[item.status]}
                      </span>
                    </td>
                    <td data-label="نوع الإجابة">
                      {item.visibility
                        ? visibilityLabels[item.visibility]
                        : "لم يحدد بعد"}
                    </td>
                    <td data-label="تاريخ الاستلام">
                      {formatDate(item.created_at)}
                    </td>
                    <td data-label="الإجراء">
                      <Link
                        href={`/dashboard/scientific-fatwas/inbox/${item.id}`}
                        className="ui-button ui-button--secondary ui-focus"
                      >
                        {item.status === "new" ? "مراجعة ورد" : "فتح التفاصيل"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className={styles.pagination} aria-label="صفحات صندوق الأسئلة">
            <Link
              href={fatwaInboxPageHref(
                query,
                Math.max(1, paginator.current_page - 1),
              )}
              aria-disabled={paginator.current_page <= 1}
              tabIndex={paginator.current_page <= 1 ? -1 : undefined}
              className={`ui-button ui-button--secondary ui-focus ${
                paginator.current_page <= 1 ? styles.disabledLink : ""
              }`}
            >
              السابق
            </Link>
            <span>
              صفحة {formatArabicNumber(paginator.current_page)} من{" "}
              {formatArabicNumber(paginator.last_page)}
            </span>
            <Link
              href={fatwaInboxPageHref(
                query,
                Math.min(paginator.last_page, paginator.current_page + 1),
              )}
              aria-disabled={paginator.current_page >= paginator.last_page}
              tabIndex={
                paginator.current_page >= paginator.last_page ? -1 : undefined
              }
              className={`ui-button ui-button--secondary ui-focus ${
                paginator.current_page >= paginator.last_page
                  ? styles.disabledLink
                  : ""
              }`}
            >
              التالي
            </Link>
          </nav>
        </div>
      )}
    </section>
  );
}
