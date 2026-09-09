"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { PageContainer } from "@/shared/components/layout/page-container";
import {
  Button,
  Dialog,
  EmptyState,
  ErrorState,
  FilterPanel,
  HeroSection,
  Skeleton,
} from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import {
  approveComment,
  bulkDeleteComments,
  deleteComment,
  getCommentOptions,
  getCommentsStats,
  listComments,
} from "../application/comments.client";
import {
  commentStatusLabels,
  commentStatuses,
  fallbackCommentOptions,
  formatCommentDate,
  type CommentOptions,
  type CommentsPage,
  type CommentsSummary,
  type ContentComment,
} from "../domain/comments.contracts";
import { resolveCommentTargetLabel } from "../domain/comment-target-labels";
import { commentsQueryFromSearchParams } from "../infrastructure/comments.query";
import { CommentStatusBadge } from "./comment-status-badge";
import { PageSelectionCheckbox } from "./page-selection-checkbox";
import styles from "./comments.module.css";

type DeleteIntent = {
  ids: number[];
  label: string;
};

const emptyStats: CommentsSummary = { total: 0, pending: 0, approved: 0 };

function removeFromStats(
  current: CommentsSummary | undefined,
  removed: readonly ContentComment[],
): CommentsSummary | undefined {
  if (!current) return current;
  return removed.reduce(
    (next, item) => ({
      total: Math.max(0, next.total - 1),
      pending:
        item.status === "pending"
          ? Math.max(0, next.pending - 1)
          : next.pending,
      approved:
        item.status === "approved"
          ? Math.max(0, next.approved - 1)
          : next.approved,
    }),
    current,
  );
}

export function CommentsManagementView() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = useMemo(
    () => commentsQueryFromSearchParams(searchParams),
    [searchParams],
  );
  const querySearch = query.search ?? "";
  const queryScope = `${querySearch}|${query.status ?? ""}|${query.target_type ?? ""}|${query.page}|${query.per_page}`;
  const [searchDraft, setSearchDraft] = useState({
    base: querySearch,
    value: querySearch,
  });
  const search =
    searchDraft.base === querySearch ? searchDraft.value : querySearch;
  const [page, setPage] = useState<CommentsPage>();
  const [stats, setStats] = useState<CommentsSummary>();
  const [options, setOptions] = useState<CommentOptions>(
    fallbackCommentOptions,
  );
  const [selection, setSelection] = useState<{
    scope: string;
    ids: Set<number>;
  }>({ scope: queryScope, ids: new Set() });
  const selected =
    selection.scope === queryScope ? selection.ids : new Set<number>();
  const [deleteIntent, setDeleteIntent] = useState<DeleteIntent>();
  const [pendingAction, setPendingAction] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const hasPageRef = useRef(false);

  const setQuery = useCallback(
    (changes: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
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
    void getCommentOptions(controller.signal)
      .then((result) =>
        setOptions({
          statuses: result.statuses.length
            ? result.statuses
            : fallbackCommentOptions.statuses,
          target_types: result.target_types.length
            ? result.target_types
            : fallbackCommentOptions.target_types,
        }),
      )
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError"))
          setOptions(fallbackCommentOptions);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    if (hasPageRef.current) setRefreshing(true);
    else setLoading(true);
    void listComments(query, controller.signal)
      .then((result) => {
        if (!active) return;
        hasPageRef.current = true;
        setPage(result);
        setError("");
      })
      .catch((reason: unknown) => {
        if (
          active &&
          !(reason instanceof DOMException && reason.name === "AbortError")
        ) {
          setError(
            reason instanceof Error ? reason.message : "تعذر تحميل التعليقات.",
          );
        }
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
        setRefreshing(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [query, reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    void getCommentsStats(controller.signal)
      .then(setStats)
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          // The list stays usable when the auxiliary summary is unavailable.
        }
      });
    return () => controller.abort();
  }, [reloadKey]);

  function setSearch(value: string) {
    setSearchDraft({ base: querySearch, value });
  }

  function setSelected(
    next: Set<number> | ((current: Set<number>) => Set<number>),
  ) {
    setSelection((current) => {
      const currentIds =
        current.scope === queryScope ? current.ids : new Set<number>();
      return {
        scope: queryScope,
        ids: typeof next === "function" ? next(currentIds) : next,
      };
    });
  }

  function toggle(id: number, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const items = page?.data ?? [];
  const pageIds = items.map((item) => item.id);
  const selectedOnPage = pageIds.filter((id) => selected.has(id));
  const allPageSelected =
    pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const selectionIndeterminate =
    selectedOnPage.length > 0 && selectedOnPage.length < pageIds.length;
  const filtered = Boolean(
    query.search || query.status || query.target_type || query.per_page !== 20,
  );
  const actionDisabled = Boolean(pendingAction) || refreshing;

  async function approve(item: ContentComment) {
    if (pendingAction) return;
    const snapshotPage = page;
    const snapshotStats = stats;
    setPendingAction(`approve:${item.id}`);
    setActionError("");
    setNotice("");
    setPage((current) =>
      current
        ? {
            ...current,
            data: current.data.map((entry) =>
              entry.id === item.id
                ? {
                    ...entry,
                    status: "approved",
                    approved_at: new Date().toISOString(),
                  }
                : entry,
            ),
          }
        : current,
    );
    setStats((current) =>
      current
        ? {
            ...current,
            pending: Math.max(0, current.pending - 1),
            approved: current.approved + 1,
          }
        : current,
    );
    try {
      const updated = await approveComment(item.id);
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
      setNotice("تم اعتماد التعليق وأصبح ظاهرًا للعامة.");
      setReloadKey((value) => value + 1);
      router.refresh();
    } catch (reason) {
      setPage(snapshotPage);
      setStats(snapshotStats);
      setActionError(
        reason instanceof Error ? reason.message : "تعذر اعتماد التعليق.",
      );
    } finally {
      setPendingAction(undefined);
    }
  }

  async function confirmDelete() {
    if (!deleteIntent || pendingAction) return;
    const ids = new Set(deleteIntent.ids);
    const removed = items.filter((item) => ids.has(item.id));
    const snapshotPage = page;
    const snapshotStats = stats;
    setPendingAction(deleteIntent.ids.length > 1 ? "bulk-delete" : "delete");
    setActionError("");
    setNotice("");
    setPage((current) =>
      current
        ? {
            ...current,
            data: current.data.filter((item) => !ids.has(item.id)),
            meta: {
              ...current.meta,
              total: Math.max(0, current.meta.total - removed.length),
            },
          }
        : current,
    );
    setStats((current) => removeFromStats(current, removed));
    try {
      if (deleteIntent.ids.length === 1) {
        await deleteComment(deleteIntent.ids[0] ?? 0);
      } else {
        await bulkDeleteComments(deleteIntent.ids);
      }
      setSelected((current) => {
        const next = new Set(current);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      setDeleteIntent(undefined);
      setNotice(
        deleteIntent.ids.length === 1
          ? "تم حذف التعليق نهائيًا."
          : `تم حذف ${formatArabicNumber(deleteIntent.ids.length)} تعليقات نهائيًا.`,
      );
      if (items.length === removed.length && query.page > 1) {
        setQuery({ page: String(query.page - 1) });
      } else {
        setReloadKey((value) => value + 1);
      }
      router.refresh();
    } catch (reason) {
      setPage(snapshotPage);
      setStats(snapshotStats);
      setActionError(
        reason instanceof Error ? reason.message : "تعذر حذف التعليقات.",
      );
    } finally {
      setPendingAction(undefined);
    }
  }

  const displayStats = stats ?? emptyStats;

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="تفاعل الزوار"
          title={dashboardCopy.modules.comments.navigation}
          description="راجع تعليقات مواد الموقع، اعتمد المناسب منها، واحذف غير الملائم بأمان من مساحة واحدة."
          leading={
            <span className={styles.heroIcon} aria-hidden="true">
              ❞
            </span>
          }
        />
      }
    >
      <main className={styles.page} dir="rtl">
        <section className={styles.metrics} aria-label="ملخص التعليقات">
          <article>
            <span>كل التعليقات</span>
            <strong>
              {stats ? formatArabicNumber(displayStats.total) : "—"}
            </strong>
            <small>على جميع مواد الموقع</small>
          </article>
          <article>
            <span>بانتظار المراجعة</span>
            <strong>
              {stats ? formatArabicNumber(displayStats.pending) : "—"}
            </strong>
            <small>لن تظهر للعامة قبل الاعتماد</small>
          </article>
          <article>
            <span>منشورة للعامة</span>
            <strong>
              {stats ? formatArabicNumber(displayStats.approved) : "—"}
            </strong>
            <small>تعليقات تم اعتمادها</small>
          </article>
        </section>

        <FilterPanel
          title="البحث والتصفية"
          description="ابحث في نص التعليق أو عنوان المادة، وخصص النتائج بالحالة أو قسم المحتوى."
        >
          <div className={styles.filters}>
            <label className={styles.searchField}>
              <span>البحث</span>
              <div>
                <input
                  className="ui-input"
                  value={search}
                  maxLength={180}
                  placeholder="نص التعليق، عنوان المادة أو المعرّف..."
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
              <span>حالة التعليق</span>
              <select
                className="ui-input"
                value={query.status ?? ""}
                onChange={(event) =>
                  setQuery({
                    status: event.target.value || undefined,
                    page: undefined,
                  })
                }
              >
                <option value="">كل الحالات</option>
                {commentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {commentStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>قسم المحتوى</span>
              <select
                className="ui-input"
                value={query.target_type ?? ""}
                onChange={(event) =>
                  setQuery({
                    target_type: event.target.value || undefined,
                    page: undefined,
                  })
                }
              >
                <option value="">كل الموديولات</option>
                {options.target_types.map((option) => (
                  <option key={option.value} value={option.value}>
                    {resolveCommentTargetLabel(option.value, option.label)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>عدد النتائج</span>
              <select
                className="ui-input"
                value={query.per_page}
                onChange={(event) =>
                  setQuery({ per_page: event.target.value, page: undefined })
                }
              >
                {[20, 50, 100].map((value) => (
                  <option key={value} value={value}>
                    {formatArabicNumber(value)}
                  </option>
                ))}
              </select>
            </label>
            {filtered && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setQuery({
                    search: undefined,
                    status: undefined,
                    target_type: undefined,
                    page: undefined,
                    per_page: undefined,
                  });
                }}
              >
                مسح الفلاتر
              </Button>
            )}
          </div>
        </FilterPanel>

        <div
          className={styles.liveRegion}
          aria-live="polite"
          aria-atomic="true"
        >
          {notice && <p className={styles.successNotice}>{notice}</p>}
          {actionError && (
            <p className={styles.errorNotice} role="alert">
              {actionError}
            </p>
          )}
          {refreshing && (
            <span className={styles.refreshing}>جارٍ تحديث البيانات…</span>
          )}
        </div>

        {selected.size > 0 && (
          <section
            className={styles.bulkBar}
            aria-label="إجراءات التعليقات المحددة"
          >
            <div>
              <strong>{formatArabicNumber(selected.size)} تعليقات محددة</strong>
              <span>سيكون الحذف نهائيًا ولا يمكن التراجع عنه.</span>
            </div>
            <div>
              <Button
                variant="secondary"
                onClick={() => setSelected(new Set())}
              >
                إلغاء التحديد
              </Button>
              <Button
                variant="danger"
                disabled={actionDisabled}
                onClick={() =>
                  setDeleteIntent({
                    ids: [...selected],
                    label: `${formatArabicNumber(selected.size)} تعليقات محددة`,
                  })
                }
              >
                حذف المحدد
              </Button>
            </div>
          </section>
        )}

        {loading ? (
          <div
            className={styles.skeletons}
            aria-busy="true"
            aria-label="جارٍ تحميل التعليقات"
          >
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} style={{ minBlockSize: "6rem" }} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="تعذر تحميل التعليقات"
            description={error}
            onRetry={() => {
              setError("");
              setLoading(true);
              setReloadKey((value) => value + 1);
            }}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={filtered ? "لا توجد تعليقات مطابقة" : "لا توجد تعليقات بعد"}
            description={
              filtered
                ? "غيّر عبارة البحث أو الفلاتر ثم حاول مرة أخرى."
                : "ستظهر هنا تعليقات الزوار الواردة من مواد الموقع."
            }
            action={
              filtered ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setQuery({
                      search: undefined,
                      status: undefined,
                      target_type: undefined,
                      page: undefined,
                      per_page: undefined,
                    });
                  }}
                >
                  عرض كل التعليقات
                </Button>
              ) : undefined
            }
          />
        ) : (
          <section
            className={styles.tableShell}
            aria-busy={refreshing || undefined}
          >
            <div className={styles.tableHeading}>
              <div>
                <span>صندوق المراجعة</span>
                <h2>التعليقات الواردة</h2>
                <p>راجع النص ومصدره قبل اعتماده للظهور العام.</p>
              </div>
              <strong>{formatArabicNumber(page?.meta.total ?? 0)} تعليق</strong>
            </div>
            <div
              className={`${styles.tableScroll} ui-responsive-table-wrap`}
              tabIndex={0}
            >
              <table className={`${styles.table} ui-responsive-table`}>
                <thead>
                  <tr>
                    <th scope="col" className={styles.selectCell}>
                      <PageSelectionCheckbox
                        checked={allPageSelected}
                        indeterminate={selectionIndeterminate}
                        disabled={actionDisabled}
                        onChange={(checked) =>
                          setSelected((current) => {
                            const next = new Set(current);
                            pageIds.forEach((id) =>
                              checked ? next.add(id) : next.delete(id),
                            );
                            return next;
                          })
                        }
                      />
                    </th>
                    <th scope="col">التعليق</th>
                    <th scope="col">المادة المصدر</th>
                    <th scope="col">عنوان IP</th>
                    <th scope="col">الحالة</th>
                    <th scope="col">تاريخ الإرسال</th>
                    <th scope="col">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className={
                        selected.has(item.id) ? styles.selectedRow : undefined
                      }
                    >
                      <td data-label="تحديد" className={styles.selectCell}>
                        <input
                          type="checkbox"
                          className="ui-checkbox ui-focus"
                          checked={selected.has(item.id)}
                          disabled={actionDisabled}
                          aria-label={`تحديد التعليق على ${item.target.title}`}
                          onChange={(event) =>
                            toggle(item.id, event.target.checked)
                          }
                        />
                      </td>
                      <td data-label="التعليق">
                        <p className={styles.commentPreview}>{item.body}</p>
                      </td>
                      <td data-label="المادة المصدر">
                        <div className={styles.sourceCell}>
                          <strong title={item.target.title}>
                            {item.target.title}
                          </strong>
                          <small>
                            {resolveCommentTargetLabel(
                              item.target.type,
                              item.target.label,
                            )}
                          </small>
                          <code dir="ltr">{item.target.locator}</code>
                        </div>
                      </td>
                      <td data-label="عنوان IP">
                        <code
                          className={styles.ipAddress}
                          dir={item.ip_address ? "ltr" : "rtl"}
                        >
                          {item.ip_address ?? "غير متاح"}
                        </code>
                      </td>
                      <td data-label="الحالة">
                        <CommentStatusBadge status={item.status} />
                      </td>
                      <td data-label="تاريخ الإرسال">
                        <time dateTime={item.created_at ?? undefined}>
                          {formatCommentDate(
                            item.created_at,
                            item.created_at_label,
                          )}
                        </time>
                      </td>
                      <td data-label="الإجراءات">
                        <div className={styles.rowActions}>
                          <Link
                            href={`/dashboard/comments/${item.id}`}
                            className="ui-button ui-button--secondary ui-focus"
                          >
                            التفاصيل
                          </Link>
                          {item.status === "pending" && (
                            <Button
                              loading={pendingAction === `approve:${item.id}`}
                              disabled={actionDisabled}
                              onClick={() => void approve(item)}
                            >
                              قبول
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            disabled={actionDisabled}
                            onClick={() =>
                              setDeleteIntent({
                                ids: [item.id],
                                label: `التعليق على «${item.target.title}»`,
                              })
                            }
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
            <nav className={styles.pagination} aria-label="صفحات التعليقات">
              <Button
                variant="secondary"
                disabled={(page?.meta.current_page ?? 1) <= 1 || actionDisabled}
                onClick={() =>
                  setQuery({ page: String((page?.meta.current_page ?? 2) - 1) })
                }
              >
                السابق
              </Button>
              <span>
                صفحة {formatArabicNumber(page?.meta.current_page ?? 1)} من{" "}
                {formatArabicNumber(page?.meta.last_page ?? 1)}
              </span>
              <Button
                variant="secondary"
                disabled={
                  (page?.meta.current_page ?? 1) >=
                    (page?.meta.last_page ?? 1) || actionDisabled
                }
                onClick={() =>
                  setQuery({ page: String((page?.meta.current_page ?? 0) + 1) })
                }
              >
                التالي
              </Button>
            </nav>
          </section>
        )}

        <Dialog
          open={deleteIntent !== undefined}
          onOpenChange={(open) => {
            if (!open && !pendingAction) setDeleteIntent(undefined);
          }}
          dismissible={!pendingAction}
          title={
            deleteIntent && deleteIntent.ids.length > 1
              ? "حذف التعليقات المحددة"
              : "حذف التعليق"
          }
          footer={
            <div className={styles.dialogActions}>
              <Button
                variant="secondary"
                disabled={Boolean(pendingAction)}
                onClick={() => setDeleteIntent(undefined)}
              >
                تراجع
              </Button>
              <Button
                variant="danger"
                loading={
                  pendingAction === "delete" || pendingAction === "bulk-delete"
                }
                disabled={Boolean(pendingAction)}
                onClick={() => void confirmDelete()}
              >
                تأكيد الحذف النهائي
              </Button>
            </div>
          }
        >
          <div className={styles.deleteDialog} dir="rtl">
            <span aria-hidden="true">!</span>
            <div>
              <p>سيتم حذف {deleteIntent?.label} نهائيًا من قاعدة البيانات.</p>
              <strong>لا يمكن التراجع عن هذا الإجراء بعد تأكيده.</strong>
            </div>
          </div>
        </Dialog>
      </main>
    </PageContainer>
  );
}
