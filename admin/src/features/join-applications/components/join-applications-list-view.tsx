"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HeroSection, Select } from "@/shared/components/ui";
import {
  listJoinApplications,
  removeJoinApplication,
  setJoinApplicationStatus,
} from "../join-applications.client";
import {
  formatJoinApplicationDate,
  joinApplicationStatuses,
  joinApplicationStatusLabels,
  joinApplicationTypeLabels,
  type JoinApplicationPage,
  type JoinApplicationStatus,
  type JoinApplicationType,
} from "../join-applications.contracts";
import styles from "./join-applications.module.css";

export function JoinApplicationsListView({
  type,
}: {
  type: JoinApplicationType;
}) {
  const [page, setPage] = useState<JoinApplicationPage>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const query = useMemo(() => {
    const result = new URLSearchParams({
      page: String(pageNumber),
      per_page: "15",
    });
    if (search.trim()) result.set("search", search.trim());
    if (status) result.set("status", status);
    return result;
  }, [pageNumber, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setLoading(true);
        listJoinApplications(type, query)
          .then(setPage)
          .catch((reason: unknown) =>
            setError(
              reason instanceof Error ? reason.message : "تعذر تحميل الطلبات.",
            ),
          )
          .finally(() => setLoading(false));
      },
      search ? 300 : 0,
    );
    return () => window.clearTimeout(timer);
  }, [query, reload, search, type]);

  async function changeStatus(id: number, next: JoinApplicationStatus) {
    try {
      await setJoinApplicationStatus(type, id, next);
      setReload((value) => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تحديث الحالة.");
    }
  }

  async function remove(id: number, requestNumber: string) {
    if (!window.confirm(`حذف الطلب ${requestNumber} نهائيًا؟`)) return;
    try {
      await removeJoinApplication(type, id);
      setReload((value) => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حذف الطلب.");
    }
  }

  return (
    <section className={styles.stack}>
      <HeroSection
        eyebrow="إدارة الطلبات"
        title={joinApplicationTypeLabels[type]}
        description={
          page
            ? `${page.total} طلب مسجل`
            : "راجع الطلبات واتخذ الإجراء المناسب."
        }
        actions={
          <Link
            className="ui-button ui-button--primary ui-focus"
            href={`/dashboard/applications/${type}/new`}
          >
            إضافة طلب
          </Link>
        }
      />

      <section className={`ui-filter-panel ${styles.filterPanel}`}>
        <div className="ui-filter-panel__body">
          <div className={styles.filters}>
            <label>
              <span>البحث</span>
              <input
                className="ui-input ui-focus"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPageNumber(1);
                }}
                placeholder="رقم الطلب، الاسم أو الهوية"
              />
            </label>
            <label>
              <span>الحالة</span>
              <Select
                value={status}
                aria-label="الحالة"
                options={[
                  { value: "", label: "كل الحالات" },
                  ...joinApplicationStatuses.map((value) => ({
                    value,
                    label: joinApplicationStatusLabels[value],
                  })),
                ]}
                onValueChange={(value) => {
                  setStatus(value);
                  setPageNumber(1);
                }}
              />
            </label>
          </div>
        </div>
      </section>

      {error && (
        <div
          className={`${styles.error} ui-alert ui-alert--error`}
          role="alert"
        >
          {error}
        </div>
      )}
      {loading ? (
        <div className={`${styles.state} ui-state`}>جاري تحميل الطلبات...</div>
      ) : !page?.data.length ? (
        <div className={`${styles.state} ui-state`}>لا توجد طلبات مطابقة.</div>
      ) : (
        <div
          className={`${styles.tableShell} ui-card ui-responsive-table-wrap`}
          tabIndex={0}
          role="region"
          aria-label="جدول الطلبات"
        >
          <table className="ui-responsive-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>مقدم الطلب</th>
                <th>تاريخ التقديم</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {page.data.map((item) => (
                <tr key={item.id}>
                  <td data-label="رقم الطلب">
                    <strong dir="ltr">{item.request_number}</strong>
                  </td>
                  <td data-label="مقدم الطلب">
                    <strong>{item.full_name}</strong>
                    <small>{item.national_id}</small>
                  </td>
                  <td data-label="تاريخ التقديم">
                    {formatJoinApplicationDate(item.created_at)}
                  </td>
                  <td data-label="الحالة">
                    <Select
                      className={styles.statusSelect ?? ""}
                      value={item.status}
                      aria-label="حالة الطلب"
                      options={joinApplicationStatuses.map((value) => ({
                        value,
                        label: joinApplicationStatusLabels[value],
                      }))}
                      onValueChange={(value) =>
                        void changeStatus(
                          item.id,
                          value as JoinApplicationStatus,
                        )
                      }
                    />
                  </td>
                  <td data-label="الإجراءات">
                    <div className={styles.rowActions}>
                      <Link
                        className="ui-button ui-button--secondary ui-focus"
                        href={`/dashboard/applications/${type}/${item.id}`}
                      >
                        عرض
                      </Link>
                      <Link
                        className="ui-button ui-button--secondary ui-focus"
                        href={`/dashboard/applications/${type}/${item.id}/edit`}
                      >
                        تعديل
                      </Link>
                      <button
                        className="ui-button ui-button--danger ui-focus"
                        type="button"
                        onClick={() =>
                          void remove(item.id, item.request_number)
                        }
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {page && page.last_page > 1 && (
        <div className={styles.pagination}>
          <button
            className="ui-button ui-button--secondary ui-focus"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((value) => value - 1)}
          >
            السابق
          </button>
          <span>
            {pageNumber} من {page.last_page}
          </span>
          <button
            className="ui-button ui-button--secondary ui-focus"
            disabled={pageNumber >= page.last_page}
            onClick={() => setPageNumber((value) => value + 1)}
          >
            التالي
          </button>
        </div>
      )}
    </section>
  );
}
