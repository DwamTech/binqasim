import Link from "next/link";

import { Button, EmptyState, FilterPanel } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import {
  formatLibraryIndexDate,
  libraryIndexSubmissionStatuses,
  libraryIndexSubmissionStatusLabels,
  libraryIndexSubmissionTypeLabels,
  libraryIndexSubmissionTypes,
  type LibraryIndexSubmissionsPage,
  type LibraryIndexSubmissionsQuery,
} from "../domain/library-indexes.contracts";
import { libraryIndexSubmissionsHref } from "../infrastructure/library-indexes.query";
import { LibraryIndexReviewActions } from "./library-index-review-actions";
import { LibraryIndexStatusBadge } from "./library-index-status-badge";
import styles from "./library-indexes.module.css";

export function LibraryIndexSubmissionsListView({
  paginator,
  query,
}: {
  paginator: LibraryIndexSubmissionsPage;
  query: LibraryIndexSubmissionsQuery;
}) {
  const filtered = Boolean(query.status || query.search);
  const registryStats = query.type
    ? paginator.stats.by_type[query.type]
    : paginator.stats;

  return (
    <section className={styles.stack} dir="rtl">
      <nav className={styles.typeTabs} aria-label="نوع السجل">
        <Link
          href={libraryIndexSubmissionsHref(query, { type: "", page: 1 })}
          aria-current={!query.type ? "page" : undefined}
        >
          <span aria-hidden="true">⌘</span>
          <strong>كل الطلبات</strong>
          <small>السجلان في مساحة واحدة</small>
        </Link>
        {libraryIndexSubmissionTypes.map((type) => (
          <Link
            key={type}
            href={libraryIndexSubmissionsHref(query, { type, page: 1 })}
            aria-current={query.type === type ? "page" : undefined}
          >
            <span aria-hidden="true">
              {type === "golden_visit" ? "✦" : "◌"}
            </span>
            <strong>{libraryIndexSubmissionTypeLabels[type]}</strong>
            <small>
              {type === "golden_visit"
                ? "طلبات الاسم والصورة والتاريخ"
                : "طلبات الاسم والصفة والتاريخ"}
            </small>
          </Link>
        ))}
      </nav>

      <section className={styles.metrics} aria-label="ملخص النتائج الحالية">
        <article>
          <span>إجمالي السجل</span>
          <strong>{formatArabicNumber(registryStats.total)}</strong>
          <small>{query.type ? "في السجل المحدد" : "في السجلين معًا"}</small>
        </article>
        <article>
          <span>بانتظار المراجعة</span>
          <strong>{formatArabicNumber(registryStats.pending)}</strong>
          <small>تحتاج قرار مراجعة</small>
        </article>
        <article>
          <span>المقبولة</span>
          <strong>{formatArabicNumber(registryStats.approved)}</strong>
          <small>تظهر في الموقع العام</small>
        </article>
        <article>
          <span>المرفوضة</span>
          <strong>{formatArabicNumber(registryStats.rejected)}</strong>
          <small>محفوظة للمراجعة الداخلية</small>
        </article>
      </section>

      <FilterPanel
        title="البحث وتصفية الطلبات"
        description="ابحث بالاسم أو الصفة، ثم خصص النتائج بالحالة وعدد السجلات في الصفحة."
      >
        <form action="/dashboard/library-indexes" className={styles.filters}>
          {query.type && <input type="hidden" name="type" value={query.type} />}
          <label className={styles.searchField}>
            <span>البحث</span>
            <input
              className="ui-input"
              name="search"
              maxLength={180}
              defaultValue={query.search}
              placeholder="الاسم أو الصفة..."
            />
          </label>
          <label>
            <span>حالة الطلب</span>
            <select
              className="ui-input"
              name="status"
              defaultValue={query.status ?? ""}
            >
              <option value="">كل الحالات</option>
              {libraryIndexSubmissionStatuses.map((status) => (
                <option key={status} value={status}>
                  {libraryIndexSubmissionStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>عدد النتائج</span>
            <select
              className="ui-input"
              name="per_page"
              defaultValue={String(query.per_page)}
            >
              {[10, 20, 50].map((value) => (
                <option key={value} value={value}>
                  {formatArabicNumber(value)} نتيجة
                </option>
              ))}
            </select>
          </label>
          <div className={styles.filterActions}>
            <Button type="submit">تطبيق الفلاتر</Button>
            {filtered && (
              <Link
                href={libraryIndexSubmissionsHref(query, {
                  status: "",
                  search: "",
                  page: 1,
                })}
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
          title={filtered ? "لا توجد طلبات مطابقة" : "لا توجد طلبات بعد"}
          description={
            filtered
              ? "غيّر عبارة البحث أو حالة الطلب ثم حاول مرة أخرى."
              : "ستظهر هنا الطلبات المرسلة من فورمي صفحة فهارس المكتبة."
          }
          action={
            filtered ? (
              <Link
                href={libraryIndexSubmissionsHref(query, {
                  status: "",
                  search: "",
                  page: 1,
                })}
                className="ui-button ui-button--secondary ui-focus"
              >
                عرض كل طلبات السجل
              </Link>
            ) : undefined
          }
        />
      ) : (
        <section className={styles.tableShell}>
          <div className={styles.tableHeading}>
            <div>
              <span>صندوق المراجعة</span>
              <h2>طلبات سجلات المكتبة</h2>
              <p>لا يظهر أي سجل في الموقع قبل اعتماده من هنا.</p>
            </div>
            <strong>{formatArabicNumber(paginator.total)} طلب</strong>
          </div>
          <div
            className={`${styles.tableScroll} ui-responsive-table-wrap`}
            tabIndex={0}
          >
            <table className={`${styles.table} ui-responsive-table`}>
              <thead>
                <tr>
                  <th scope="col">مقدم الطلب</th>
                  <th scope="col">نوع السجل</th>
                  <th scope="col">تاريخ الزيارة</th>
                  <th scope="col">تاريخ الاستلام</th>
                  <th scope="col">الحالة</th>
                  <th scope="col">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginator.data.map((item) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td data-label="مقدم الطلب">
                      <div className={styles.identity}>
                        {item.image_url ? (
                          // Backend media origins vary by deployment.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image_url}
                            alt=""
                            width={48}
                            height={48}
                            loading="lazy"
                          />
                        ) : (
                          <span aria-hidden="true">
                            {item.type === "golden_visit" ? "✦" : "◌"}
                          </span>
                        )}
                        <div>
                          <strong>{item.name}</strong>
                          <small>{item.title || "بدون صفة إضافية"}</small>
                        </div>
                      </div>
                    </td>
                    <td data-label="نوع السجل">
                      {libraryIndexSubmissionTypeLabels[item.type]}
                    </td>
                    <td data-label="تاريخ الزيارة">
                      {formatLibraryIndexDate(item.visit_date)}
                    </td>
                    <td data-label="تاريخ الاستلام">
                      {formatLibraryIndexDate(item.created_at, true)}
                    </td>
                    <td data-label="الحالة">
                      <LibraryIndexStatusBadge status={item.status} />
                    </td>
                    <td data-label="الإجراءات">
                      <div className={styles.rowActions}>
                        <Link
                          href={`/dashboard/library-indexes/${item.type}/${item.id}`}
                          className="ui-button ui-button--secondary ui-focus"
                        >
                          فتح التفاصيل
                        </Link>
                        <LibraryIndexReviewActions item={item} compact />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className={styles.pagination} aria-label="صفحات طلبات السجلات">
            <Link
              href={libraryIndexSubmissionsHref(query, {
                page: Math.max(1, paginator.current_page - 1),
              })}
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
              href={libraryIndexSubmissionsHref(query, {
                page: Math.min(paginator.last_page, paginator.current_page + 1),
              })}
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
        </section>
      )}
    </section>
  );
}
