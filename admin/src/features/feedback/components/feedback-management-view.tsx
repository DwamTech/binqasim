"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import { PageContainer } from "@/shared/components/layout/page-container";
import {
  Button,
  EmptyState,
  ErrorState,
  HeroSection,
  Skeleton,
} from "@/shared/components/ui";
import { listFeedback, updateFeedbackStatus } from "../feedback.client";
import {
  feedbackStatuses,
  feedbackStatusLabels,
  feedbackTypeLabels,
  formatFeedbackDate,
  normalizeFeedbackQuery,
  type FeedbackItem,
  type FeedbackPage,
  type FeedbackStatus,
  type FeedbackType,
} from "../feedback.contracts";
import { FeedbackStatusBadge } from "./feedback-status-badge";
import styles from "./feedback.module.css";

export function FeedbackManagementView() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = useMemo(
    () =>
      normalizeFeedbackQuery({
        type: searchParams.get("type") ?? "complaint",
        status: searchParams.get("status") ?? undefined,
        search: searchParams.get("search") ?? undefined,
        page: searchParams.get("page") ?? 1,
        per_page: searchParams.get("per_page") ?? 15,
      }),
    [searchParams],
  );
  const [search, setSearch] = useState(query.search ?? "");
  const [page, setPage] = useState<FeedbackPage>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [pendingId, setPendingId] = useState<number>();
  const [reloadKey, setReloadKey] = useState(0);

  const setQuery = useCallback(
    (changes: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      setLoading(true);
      setError("");
      router.replace(next.size ? `${pathname}?${next}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (search.trim() === (query.search ?? "")) return;
    const timer = window.setTimeout(
      () => setQuery({ search: search.trim() || undefined, page: undefined }),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [query.search, search, setQuery]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void listFeedback(query, controller.signal)
      .then((result) => {
        if (active) {
          setPage(result);
          setError("");
        }
      })
      .catch((reason: unknown) => {
        if (
          active &&
          !(reason instanceof DOMException && reason.name === "AbortError")
        )
          setError(
            reason instanceof Error
              ? reason.message
              : "تعذر تحميل الشكاوى والمقترحات.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [query, reloadKey]);

  async function changeStatus(
    item: FeedbackItem,
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const status = event.target.value as FeedbackStatus;
    if (status === item.status || pendingId !== undefined) return;
    setPendingId(item.id);
    setStatusError("");
    try {
      const updated = await updateFeedbackStatus(String(item.id), status);
      setPage((current) =>
        current
          ? {
              ...current,
              data: current.data.map((entry) =>
                entry.id === updated.id ? updated : entry,
              ),
            }
          : current,
      );
    } catch (reason) {
      setStatusError(
        reason instanceof Error ? reason.message : "تعذر تغيير الحالة.",
      );
    } finally {
      setPendingId(undefined);
    }
  }

  const currentItems = page?.data ?? [];
  const pageNew = currentItems.filter((item) => item.status === "new").length;
  const pageReview = currentItems.filter(
    (item) => item.status === "under_review",
  ).length;

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="صوت المستفيد"
          title="إدارة الشكاوى والمقترحات"
          description="راجع الرسائل الواردة، تابع حالتها، ووثّق الاستجابة من مساحة عمل واحدة."
          leading={<span className={styles.heroIcon}>✦</span>}
        />
      }
    >
      <main className={styles.page} dir="rtl">
        <nav className={styles.tabs} aria-label="نوع الطلب">
          {(["complaint", "suggestion"] as FeedbackType[]).map((type) => (
            <button
              key={type}
              type="button"
              aria-current={query.type === type ? "page" : undefined}
              className={query.type === type ? styles.activeTab : undefined}
              onClick={() => {
                setSearch("");
                setQuery({
                  type,
                  status: undefined,
                  search: undefined,
                  page: undefined,
                });
              }}
            >
              <span aria-hidden="true">{type === "complaint" ? "!" : "✦"}</span>
              <strong>{feedbackTypeLabels[type]}</strong>
              <small>
                {type === "complaint"
                  ? "متابعة المشكلات والبلاغات"
                  : "مراجعة الأفكار وفرص التحسين"}
              </small>
            </button>
          ))}
        </nav>

        <section className={styles.metrics} aria-label="ملخص الصفحة الحالية">
          <article>
            <span>إجمالي {feedbackTypeLabels[query.type]}</span>
            <strong>{page?.total ?? "—"}</strong>
            <small>وفق الفلاتر الحالية</small>
          </article>
          <article>
            <span>جديد في الصفحة</span>
            <strong>{pageNew}</strong>
            <small>يحتاج المراجعة</small>
          </article>
          <article>
            <span>قيد المراجعة</span>
            <strong>{pageReview}</strong>
            <small>جارٍ التعامل معه</small>
          </article>
        </section>

        <section className={styles.filters}>
          <div className={styles.filterHeading}>
            <span aria-hidden="true">⌕</span>
            <div>
              <h2>البحث والتصفية</h2>
              <p>ابحث برقم الطلب أو بيانات المرسل وحدد الحالة.</p>
            </div>
          </div>
          <label className={styles.searchField}>
            <span>البحث</span>
            <div>
              <input
                className="ui-input"
                aria-label="البحث في الطلبات"
                value={search}
                placeholder="رقم الطلب، الاسم، البريد أو الهاتف..."
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  aria-label="مسح البحث"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>
          </label>
          <label>
            <span>الحالة</span>
            <select
              className="ui-input"
              aria-label="فلتر حالة الطلب"
              value={query.status ?? ""}
              onChange={(event) =>
                setQuery({
                  status: event.target.value || undefined,
                  page: undefined,
                })
              }
            >
              <option value="">كل الحالات</option>
              {feedbackStatuses.map((status) => (
                <option key={status} value={status}>
                  {feedbackStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>عدد العناصر</span>
            <select
              className="ui-input"
              aria-label="عدد الطلبات في الصفحة"
              value={query.per_page}
              onChange={(event) =>
                setQuery({ per_page: event.target.value, page: undefined })
              }
            >
              {[15, 30, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          {(query.status || query.search || query.per_page !== 15) && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setQuery({
                  status: undefined,
                  search: undefined,
                  page: undefined,
                  per_page: undefined,
                });
              }}
            >
              إعادة ضبط الفلاتر
            </Button>
          )}
        </section>

        {statusError && (
          <p className={styles.errorNotice} role="alert">
            {statusError}
          </p>
        )}

        {loading ? (
          <div className={styles.skeletons} aria-busy="true">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} style={{ minBlockSize: "5rem" }} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="تعذر تحميل الطلبات"
            description={error}
            onRetry={() => {
              setLoading(true);
              setError("");
              setReloadKey((value) => value + 1);
            }}
          />
        ) : currentItems.length === 0 ? (
          <EmptyState
            title={`لا توجد ${feedbackTypeLabels[query.type]} مطابقة`}
            description="غيّر البحث أو الحالة، أو عد لاحقًا عند وصول طلبات جديدة."
            action={
              query.status || query.search ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setQuery({
                      status: undefined,
                      search: undefined,
                      page: undefined,
                    });
                  }}
                >
                  مسح الفلاتر
                </Button>
              ) : undefined
            }
          />
        ) : (
          <section className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <div>
                <h2>{feedbackTypeLabels[query.type]} الواردة</h2>
                <p>غيّر الحالة مباشرة أو افتح الطلب لعرض كل التفاصيل.</p>
              </div>
              <span>{page?.total.toLocaleString("ar-EG")} طلب</span>
            </div>
            <div
              className={`${styles.tableScroll} ui-responsive-table-wrap`}
              tabIndex={0}
            >
              <table className="ui-responsive-table">
                <thead>
                  <tr>
                    <th scope="col">رقم الطلب</th>
                    <th scope="col">المرسل</th>
                    <th scope="col">التصنيف</th>
                    <th scope="col">الرسالة</th>
                    <th scope="col">التاريخ</th>
                    <th scope="col">الحالة</th>
                    <th scope="col">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id}>
                      <td data-label="رقم الطلب">
                        <code>{item.request_number}</code>
                      </td>
                      <td data-label="المرسل">
                        <strong>{item.name ?? "غير مسجل"}</strong>
                        <small dir="ltr">{item.email ?? "—"}</small>
                      </td>
                      <td data-label="التصنيف">
                        {item.category ?? "بدون تصنيف"}
                      </td>
                      <td data-label="الرسالة">
                        <p className={styles.messagePreview}>
                          {item.message ?? "—"}
                        </p>
                      </td>
                      <td data-label="التاريخ">
                        {formatFeedbackDate(item.created_at)}
                      </td>
                      <td data-label="الحالة">
                        <FeedbackStatusBadge status={item.status} />
                        <select
                          aria-label={`تغيير حالة ${item.request_number}`}
                          className={styles.quickStatus}
                          value={item.status}
                          disabled={pendingId !== undefined}
                          onChange={(event) => void changeStatus(item, event)}
                        >
                          {feedbackStatuses.map((status) => (
                            <option key={status} value={status}>
                              {feedbackStatusLabels[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="الإجراء">
                        <Link
                          href={`/dashboard/feedback/${item.id}`}
                          className="ui-button ui-button--secondary ui-focus"
                        >
                          عرض التفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav className={styles.pagination} aria-label="صفحات الطلبات">
              <Button
                variant="secondary"
                disabled={(page?.current_page ?? 1) <= 1}
                onClick={() =>
                  setQuery({
                    page: String((page?.current_page ?? 2) - 1),
                  })
                }
              >
                السابق
              </Button>
              <span>
                صفحة {(page?.current_page ?? 1).toLocaleString("ar-EG")} من{" "}
                {(page?.last_page ?? 1).toLocaleString("ar-EG")}
              </span>
              <Button
                variant="secondary"
                disabled={(page?.current_page ?? 1) >= (page?.last_page ?? 1)}
                onClick={() =>
                  setQuery({
                    page: String((page?.current_page ?? 0) + 1),
                  })
                }
              >
                التالي
              </Button>
            </nav>
          </section>
        )}
      </main>
    </PageContainer>
  );
}
