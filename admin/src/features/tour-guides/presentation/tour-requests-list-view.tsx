"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageContainer } from "@/shared/components/layout/page-container";
import {
  Button,
  EmptyState,
  ErrorState,
  FilterPanel,
  HeroSection,
  Input,
  Select,
  Skeleton,
} from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import {
  getTourRequestsSummary,
  listTourGuidesForFilter,
  listTourRequests,
} from "../application/tour-guides.client";
import {
  formatPreferredSchedule,
  formatTourDate,
  tourRequestStatuses,
  tourRequestStatusLabels,
  type PaginatedResource,
  type TourGuide,
  type TourRequest,
  type TourRequestsQuery,
  type TourRequestsSummary,
  type TourRequestStatus,
} from "../domain/tour-guides.contracts";
import styles from "./tour-guides.module.css";
import { TourRequestStatusBadge } from "./tour-request-status-badge";

export function TourRequestsListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = useMemo<Omit<TourRequestsQuery, "search">>(() => {
    const status = searchParams.get("status");
    const guideId = Number(searchParams.get("guide_id"));
    return {
      status: tourRequestStatuses.includes(status as TourRequestStatus)
        ? (status as TourRequestStatus)
        : undefined,
      guide_id: guideId > 0 ? guideId : undefined,
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
      page: Math.max(1, Number(searchParams.get("page")) || 1),
      per_page: 15,
    };
  }, [searchParams]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const query = useMemo<TourRequestsQuery>(
    () => ({
      ...urlQuery,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [debouncedSearch, urlQuery],
  );
  const [page, setPage] = useState<PaginatedResource<TourRequest>>();
  const [summary, setSummary] = useState<TourRequestsSummary>();
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const setQuery = useCallback(
    (changes: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams);
      next.delete("search");
      Object.entries(changes).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      router.replace(next.size ? `${pathname}?${next}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!searchParams.has("search")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("search");
    router.replace(next.size ? `${pathname}?${next}` : pathname);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [requests, totals, guidePage] = await Promise.all([
          listTourRequests(query, controller.signal),
          getTourRequestsSummary(controller.signal),
          listTourGuidesForFilter(controller.signal),
        ]);
        if (!active) return;
        setPage(requests);
        setSummary(totals);
        setGuides(guidePage);
        setError("");
      } catch (reason) {
        if (active)
          setError(
            reason instanceof Error ? reason.message : "تعذر تحميل الطلبات.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [query, reloadKey]);

  const filtered = Boolean(
    query.search ||
    query.status ||
    query.guide_id ||
    query.date_from ||
    query.date_to,
  );

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة الرحلات السياحية"
          title="إدارة طلبات الرحلات"
          description="صندوق تشغيل مركزي لمراجعة بيانات الزوار والمرشد المختار وتتبّع حالة كل رحلة."
          actions={
            <Link
              className="ui-button ui-button--secondary ui-focus"
              href="/dashboard/tour-guides/guides"
            >
              دليل المرشدين
            </Link>
          }
        />
      }
    >
      <main className={styles.page}>
        <section className={styles.requestMetrics} aria-label="ملخص الطلبات">
          <RequestMetric label="كل الطلبات" value={summary?.requests_total} />
          <RequestMetric
            label="طلبات جديدة"
            value={summary?.new}
            tone="warning"
          />
          <RequestMetric
            label="قيد التنفيذ"
            value={summary?.in_progress}
            tone="info"
          />
          <RequestMetric
            label="منتهية"
            value={summary?.completed}
            tone="success"
          />
        </section>

        <FilterPanel
          className={styles.requestFilterPanel ?? ""}
          title="البحث والتصفية"
          description="استخدم أكثر من فلتر للوصول السريع إلى الطلب المطلوب."
        >
          <div className={styles.requestFilters}>
            <label className={styles.searchField}>
              <span>بحث سريع</span>
              <Input
                value={search}
                maxLength={255}
                placeholder="رقم الطلب أو كلمات البحث..."
                onChange={(event) => {
                  setSearch(event.target.value);
                  if (urlQuery.page > 1) setQuery({ page: undefined });
                }}
              />
            </label>
            <label>
              <span>حالة الطلب</span>
              <Select
                value={query.status ?? ""}
                options={[
                  { value: "", label: "كل الحالات" },
                  ...tourRequestStatuses.map((status) => ({
                    value: status,
                    label: tourRequestStatusLabels[status],
                  })),
                ]}
                onValueChange={(value) =>
                  setQuery({ status: value || undefined, page: undefined })
                }
              />
            </label>
            <label>
              <span>المرشد المطلوب</span>
              <Select
                value={query.guide_id ? String(query.guide_id) : ""}
                options={[
                  { value: "", label: "كل المرشدين" },
                  ...guides.map((guide) => ({
                    value: String(guide.id),
                    label: guide.name,
                  })),
                ]}
                onValueChange={(value) =>
                  setQuery({ guide_id: value || undefined, page: undefined })
                }
              />
              <small className={styles.filterHint}>
                للطلبات القديمة المرتبطة بمرشد مؤرشف، استخدم البحث الحر.
              </small>
            </label>
            <label>
              <span>تاريخ الاستلام من</span>
              <Input
                type="date"
                dir="ltr"
                max={query.date_to}
                value={query.date_from ?? ""}
                onChange={(event) =>
                  setQuery({
                    date_from: event.target.value || undefined,
                    page: undefined,
                  })
                }
              />
            </label>
            <label>
              <span>تاريخ الاستلام إلى</span>
              <Input
                type="date"
                dir="ltr"
                min={query.date_from}
                value={query.date_to ?? ""}
                onChange={(event) =>
                  setQuery({
                    date_to: event.target.value || undefined,
                    page: undefined,
                  })
                }
              />
            </label>
            {filtered && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                  setQuery({
                    status: undefined,
                    guide_id: undefined,
                    date_from: undefined,
                    date_to: undefined,
                    page: undefined,
                  });
                }}
              >
                مسح الفلاتر
              </Button>
            )}
          </div>
        </FilterPanel>

        {loading ? (
          <div className={styles.skeletons} aria-label="تحميل الطلبات">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} style={{ minBlockSize: "6rem" }} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="تعذر تحميل طلبات الرحلات"
            description={error}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : !page?.data.length ? (
          <EmptyState
            title={
              filtered ? "لا توجد نتائج مطابقة" : "لا توجد طلبات رحلات بعد"
            }
            description={
              filtered
                ? "غيّر الفلاتر ثم حاول مرة أخرى."
                : "ستظهر هنا الطلبات الواردة من بوابة الزائر فور إرسالها."
            }
          />
        ) : (
          <section
            className={`${styles.tableShell} ${styles.requestsTableShell}`}
          >
            <header
              className={`${styles.tableHeading} ${styles.requestsTableHeading}`}
            >
              <div>
                <small>صندوق الطلبات</small>
                <h2>الطلبات الواردة</h2>
              </div>
              <strong>{formatArabicNumber(page.meta.total)} طلب</strong>
            </header>
            <div
              className={`${styles.requestsTableWrap} ui-responsive-table-wrap`}
              tabIndex={0}
              role="region"
              aria-label="جدول طلبات الرحلات"
            >
              <table
                className={`${styles.table} ${styles.requestsTable} ui-responsive-table`}
              >
                <thead>
                  <tr>
                    <th>الطلب والزائر</th>
                    <th>المرشد</th>
                    <th>موعد الرحلة</th>
                    <th>المشاركون</th>
                    <th>الحالة</th>
                    <th>تاريخ الاستلام</th>
                    <th>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {page.data.map((request) => (
                    <tr
                      key={request.id}
                      className={
                        request.status === "new"
                          ? styles.newRequestRow
                          : undefined
                      }
                    >
                      <td data-label="الطلب والزائر">
                        <div className={styles.requestIdentity}>
                          <code dir="ltr">{request.reference}</code>
                          <strong>{request.full_name}</strong>
                          <small dir="ltr">{request.phone}</small>
                        </div>
                      </td>
                      <td data-label="المرشد">
                        <div className={styles.requestGuideSummary}>
                          <strong>{request.guide.name}</strong>
                          <small>{request.tour_route}</small>
                        </div>
                      </td>
                      <td data-label="موعد الرحلة">
                        <span className={styles.requestSchedule}>
                          {formatPreferredSchedule(request)}
                        </span>
                      </td>
                      <td data-label="المشاركون">
                        <span className={styles.participantsCount}>
                          {formatArabicNumber(request.participants_count)}
                        </span>
                      </td>
                      <td data-label="الحالة">
                        <TourRequestStatusBadge status={request.status} />
                      </td>
                      <td data-label="تاريخ الاستلام">
                        <time
                          className={styles.requestReceivedDate}
                          dateTime={request.created_at ?? undefined}
                        >
                          {formatTourDate(request.created_at)}
                        </time>
                      </td>
                      <td data-label="الإجراء">
                        <Link
                          className={`${styles.reviewRequestButton} ui-button ui-button--secondary ui-focus`}
                          href={`/dashboard/tour-guides/requests/${request.id}`}
                        >
                          مراجعة الطلب
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {page.meta.last_page > 1 && (
              <nav className={styles.pagination} aria-label="صفحات الطلبات">
                <Button
                  variant="secondary"
                  disabled={query.page <= 1}
                  onClick={() => setQuery({ page: String(query.page - 1) })}
                >
                  السابق
                </Button>
                <span>
                  صفحة {formatArabicNumber(query.page)} من{" "}
                  {formatArabicNumber(page.meta.last_page)}
                </span>
                <Button
                  variant="secondary"
                  disabled={query.page >= page.meta.last_page}
                  onClick={() => setQuery({ page: String(query.page + 1) })}
                >
                  التالي
                </Button>
              </nav>
            )}
          </section>
        )}
      </main>
    </PageContainer>
  );
}

function RequestMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | undefined;
  tone?: "default" | "warning" | "info" | "success";
}) {
  return (
    <article
      className={`${styles.requestMetric} ${styles[`requestMetric_${tone}`]}`}
    >
      <span>{label}</span>
      <strong>{value === undefined ? "—" : formatArabicNumber(value)}</strong>
    </article>
  );
}
