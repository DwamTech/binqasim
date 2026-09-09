"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  deleteListeningSeries,
  deleteListeningSession,
  getListeningSeries,
} from "../application/listening.client";
import type {
  ListeningSeries,
  ListeningSeriesPage,
  ListeningSeriesSummary,
  ListeningSession,
  ListeningSessionPage,
  ListeningStats,
} from "../domain/listening.contracts";
import { Button, Dialog, EmptyState } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import { ListeningSeriesForm } from "./listening-series-form";
import { ListeningSessionForm } from "./listening-session-form";
import {
  filterWorkspaceSeries,
  filterWorkspaceSessions,
  resolveSeriesAfterDelete,
  resolveWorkspaceSeriesId,
  updateSeriesSessionCounts,
  upsertWorkspaceRecord,
  type ListeningWorkspaceStatus,
} from "./listening-workspace.state";
import styles from "./listening.module.css";

type WorkspaceEditor =
  | { kind: "series"; record: ListeningSeries | null }
  | { kind: "session"; record: ListeningSession | null };

type WorkspaceDeleteTarget =
  | { kind: "series"; record: ListeningSeries }
  | { kind: "session"; record: ListeningSession };

function replaceSelectedSeriesInUrl(seriesId: string | null, push = false) {
  const url = new URL(window.location.href);
  if (seriesId) url.searchParams.set("series_id", seriesId);
  else url.searchParams.delete("series_id");
  window.history[push ? "pushState" : "replaceState"]({}, "", url);
}

function safeMediaUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("/")) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol)
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function seriesSummary(series: ListeningSeries[]): ListeningSeriesSummary[] {
  return series.map(({ id, slug, title, short_title }) => ({
    id,
    slug,
    title,
    short_title,
  }));
}

function emptySessionPage(
  series: ListeningSeries[],
  stats: ListeningStats = { total: 0, published: 0, drafts: 0 },
): ListeningSessionPage {
  return {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 100,
    total: 0,
    filter_options: { series: seriesSummary(series) },
    stats,
  };
}

function sessionPageFromSeries(detail: ListeningSeries): ListeningSessionPage {
  const sessions = (detail.sessions ?? []).toSorted(
    (left, right) => left.sequence_number - right.sequence_number,
  );
  const published = sessions.filter((item) => item.is_published).length;
  return {
    ...emptySessionPage([], {
      total: sessions.length,
      published,
      drafts: sessions.length - published,
    }),
    data: sessions,
    total: sessions.length,
  };
}

function publicationLabel(isPublished: boolean, publishedAt: string | null) {
  if (!isPublished) return "مسودة";
  if (publishedAt && new Date(publishedAt).getTime() > Date.now()) {
    return "مجدولة";
  }
  return "مفعّلة";
}

function updateStatsForPublication(
  current: ListeningStats,
  previousPublished: boolean | undefined,
  nextPublished: boolean,
): ListeningStats {
  if (previousPublished === nextPublished) return current;
  if (previousPublished === undefined) {
    return {
      total: current.total + 1,
      published: current.published + (nextPublished ? 1 : 0),
      drafts: current.drafts + (nextPublished ? 0 : 1),
    };
  }
  return {
    ...current,
    published: Math.max(0, current.published + (nextPublished ? 1 : -1)),
    drafts: Math.max(0, current.drafts + (nextPublished ? -1 : 1)),
  };
}

export function ListeningWorkspace({
  initialSeriesPage,
  initialSelectedSeriesId,
  initialSelectedSeries,
  initialSeriesSearch = "",
  initialSeriesStatus = "all",
  initialNotice = null,
}: {
  initialSeriesPage: ListeningSeriesPage;
  initialSelectedSeriesId?: string | null;
  initialSelectedSeries?: ListeningSeries;
  initialSeriesSearch?: string;
  initialSeriesStatus?: ListeningWorkspaceStatus;
  initialNotice?: string | null;
}) {
  const initialSeriesRecords = initialSelectedSeries
    ? upsertWorkspaceRecord(initialSeriesPage.data, initialSelectedSeries)
    : initialSeriesPage.data;
  const resolvedInitialSeriesId = resolveWorkspaceSeriesId(
    initialSeriesRecords,
    initialSelectedSeriesId ?? undefined,
  );
  const [series, setSeries] = useState(initialSeriesRecords);
  const [seriesStats, setSeriesStats] = useState(initialSeriesPage.stats);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(
    resolvedInitialSeriesId,
  );
  const [sessionPages, setSessionPages] = useState<
    Record<string, ListeningSessionPage>
  >(() =>
    resolvedInitialSeriesId && initialSelectedSeries
      ? {
          [resolvedInitialSeriesId]: sessionPageFromSeries(
            initialSelectedSeries,
          ),
        }
      : {},
  );
  const [seriesSearch, setSeriesSearch] = useState(initialSeriesSearch);
  const [seriesStatus, setSeriesStatus] =
    useState<ListeningWorkspaceStatus>(initialSeriesStatus);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionStatus, setSessionStatus] =
    useState<ListeningWorkspaceStatus>("all");
  const [sessionErrors, setSessionErrors] = useState<Record<string, string>>(
    {},
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [editor, setEditor] = useState<WorkspaceEditor | null>(null);
  const [formDirty, setFormDirty] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<WorkspaceDeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(initialNotice);
  const refreshVersionsRef = useRef<Record<string, number>>({});
  const deletedSeriesIdsRef = useRef(new Set<string>());

  const selectedSeries =
    series.find((item) => item.id === selectedSeriesId) ?? null;
  const selectedSessionPage = selectedSeriesId
    ? sessionPages[selectedSeriesId]
    : undefined;
  const sessionsError = selectedSeriesId
    ? (sessionErrors[selectedSeriesId] ?? null)
    : null;
  const sessionsLoading = Boolean(
    selectedSeriesId && !selectedSessionPage && !sessionsError,
  );
  const filteredSeries = useMemo(
    () => filterWorkspaceSeries(series, seriesSearch, seriesStatus),
    [series, seriesSearch, seriesStatus],
  );
  const filteredSessions = useMemo(
    () =>
      filterWorkspaceSessions(
        selectedSessionPage?.data ?? [],
        sessionSearch,
        sessionStatus,
      ).toSorted((left, right) => left.sequence_number - right.sequence_number),
    [selectedSessionPage, sessionSearch, sessionStatus],
  );
  const catalog = useMemo(() => seriesSummary(series), [series]);
  const nextSessionSequence = useMemo(
    () =>
      Math.max(
        0,
        ...(selectedSessionPage?.data.map((item) => item.sequence_number) ??
          []),
      ) + 1,
    [selectedSessionPage],
  );

  useEffect(() => {
    replaceSelectedSeriesInUrl(selectedSeriesId);
  }, [selectedSeriesId]);

  useEffect(() => {
    if (!formDirty && !formSubmitting) return;
    const protectUnsavedForm = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", protectUnsavedForm);
    return () => window.removeEventListener("beforeunload", protectUnsavedForm);
  }, [formDirty, formSubmitting]);

  useEffect(() => {
    const restoreSelection = () => {
      const requested = new URL(window.location.href).searchParams.get(
        "series_id",
      );
      if (editor) {
        if (
          formSubmitting ||
          (formDirty &&
            !window.confirm("لديك تعديلات غير محفوظة. هل تريد تجاهلها؟"))
        ) {
          // Re-add the logical current entry after a cancelled Back/Forward.
          // This preserves the entry the browser landed on instead of mutating it.
          replaceSelectedSeriesInUrl(selectedSeriesId, true);
          return;
        }
        setEditor(null);
        setFormDirty(false);
      }
      const restored = resolveWorkspaceSeriesId(series, requested ?? undefined);
      setSelectedSeriesId(restored);
      setSessionSearch("");
      setSessionStatus("all");
      if (requested && restored !== requested) {
        setNotice("السلسلة المطلوبة لم تعد موجودة؛ تم فتح سلسلة متاحة.");
      } else {
        setNotice(null);
      }
    };
    window.addEventListener("popstate", restoreSelection);
    return () => window.removeEventListener("popstate", restoreSelection);
  }, [editor, formDirty, formSubmitting, selectedSeriesId, series]);

  useEffect(() => {
    if (
      !selectedSeriesId ||
      sessionPages[selectedSeriesId] ||
      sessionErrors[selectedSeriesId]
    )
      return;

    const controller = new AbortController();
    void getListeningSeries(selectedSeriesId, controller.signal)
      .then((detail) => {
        setSeries((current) => upsertWorkspaceRecord(current, detail));
        setSessionPages((current) => ({
          ...current,
          [selectedSeriesId]: sessionPageFromSeries(detail),
        }));
        setSessionErrors((current) => {
          const next = { ...current };
          delete next[selectedSeriesId];
          return next;
        });
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") {
          return;
        }
        setSessionErrors((current) => ({
          ...current,
          [selectedSeriesId]:
            reason instanceof Error
              ? reason.message
              : "تعذر تحميل مجالس السلسلة.",
        }));
      });

    return () => controller.abort();
  }, [reloadKey, selectedSeriesId, sessionErrors, sessionPages]);

  async function refreshSeriesContext(seriesId: string) {
    const version = (refreshVersionsRef.current[seriesId] ?? 0) + 1;
    refreshVersionsRef.current[seriesId] = version;
    try {
      const detail = await getListeningSeries(seriesId);
      if (
        deletedSeriesIdsRef.current.has(seriesId) ||
        refreshVersionsRef.current[seriesId] !== version
      ) {
        return;
      }
      setSeries((current) =>
        current.some((item) => item.id === seriesId)
          ? upsertWorkspaceRecord(current, detail)
          : current,
      );
      setSessionPages((current) => ({
        ...current,
        [seriesId]: sessionPageFromSeries(detail),
      }));
      setSessionErrors((current) => {
        if (!current[seriesId]) return current;
        const next = { ...current };
        delete next[seriesId];
        return next;
      });
    } catch {
      // The optimistic workspace state remains usable; a later retry revalidates it.
    }
  }

  function openEditor(nextEditor: WorkspaceEditor) {
    setFormDirty(false);
    setFormSubmitting(false);
    setEditor(nextEditor);
  }

  function closeEditor() {
    if (formSubmitting) return;
    if (
      formDirty &&
      !window.confirm("لديك تعديلات غير محفوظة. هل تريد تجاهلها؟")
    ) {
      return;
    }
    setFormDirty(false);
    setEditor(null);
  }

  function selectSeries(seriesId: string, push = true) {
    setSelectedSeriesId(seriesId);
    setSessionSearch("");
    setSessionStatus("all");
    setNotice(null);
    replaceSelectedSeriesInUrl(seriesId, push);
  }

  function handleSeriesSaved(saved: ListeningSeries) {
    deletedSeriesIdsRef.current.delete(saved.id);
    const previous = series.find((item) => item.id === saved.id);
    setSeries((current) => upsertWorkspaceRecord(current, saved));
    setSeriesStats((current) =>
      updateStatsForPublication(
        current,
        previous?.is_published,
        saved.is_published,
      ),
    );
    setEditor(null);
    setFormDirty(false);
    selectSeries(saved.id, false);
    setNotice(
      previous ? "تم حفظ تعديلات السلسلة." : "تمت إضافة السلسلة بنجاح.",
    );
    if (!sessionPages[saved.id]) {
      setSessionPages((current) => ({
        ...current,
        [saved.id]: emptySessionPage(series),
      }));
    }
    void refreshSeriesContext(saved.id);
  }

  function handleSessionSaved(saved: ListeningSession) {
    const page = sessionPages[saved.listening_series_id];
    const previous = page?.data.find((item) => item.id === saved.id);
    const totalDelta = previous ? 0 : 1;
    const publishedDelta = previous
      ? Number(saved.is_published) - Number(previous.is_published)
      : Number(saved.is_published);

    setSessionPages((current) => {
      const currentPage =
        current[saved.listening_series_id] ??
        emptySessionPage(series, page?.stats);
      return {
        ...current,
        [saved.listening_series_id]: {
          ...currentPage,
          data: upsertWorkspaceRecord(currentPage.data, saved),
          total: currentPage.total + totalDelta,
          stats: updateStatsForPublication(
            currentPage.stats,
            previous?.is_published,
            saved.is_published,
          ),
        },
      };
    });
    setSeries((current) =>
      updateSeriesSessionCounts(
        current,
        saved.listening_series_id,
        totalDelta,
        publishedDelta,
      ),
    );
    setEditor(null);
    setFormDirty(false);
    setNotice(previous ? "تم حفظ تعديلات المجلس." : "تمت إضافة المجلس بنجاح.");
    void refreshSeriesContext(saved.listening_series_id);
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      if (deleteTarget.kind === "series") {
        await deleteListeningSeries(deleteTarget.record.id);
        deletedSeriesIdsRef.current.add(deleteTarget.record.id);
        refreshVersionsRef.current[deleteTarget.record.id] =
          (refreshVersionsRef.current[deleteTarget.record.id] ?? 0) + 1;
        const { remaining, selectedId: nextSeriesId } =
          resolveSeriesAfterDelete(
            series,
            deleteTarget.record.id,
            selectedSeriesId,
          );
        setSeries(remaining);
        setSeriesStats((current) => ({
          total: Math.max(0, current.total - 1),
          published: Math.max(
            0,
            current.published - Number(deleteTarget.record.is_published),
          ),
          drafts: Math.max(
            0,
            current.drafts - Number(!deleteTarget.record.is_published),
          ),
        }));
        setSessionPages((current) => {
          const next = { ...current };
          delete next[deleteTarget.record.id];
          return next;
        });
        setSelectedSeriesId(nextSeriesId);
        replaceSelectedSeriesInUrl(nextSeriesId);
        setNotice("تم حذف السلسلة وكل مجالسها المرتبطة.");
      } else {
        await deleteListeningSession(deleteTarget.record.id);
        const { record } = deleteTarget;
        setSessionPages((current) => {
          const currentPage = current[record.listening_series_id];
          if (!currentPage) return current;
          return {
            ...current,
            [record.listening_series_id]: {
              ...currentPage,
              data: currentPage.data.filter((item) => item.id !== record.id),
              total: Math.max(0, currentPage.total - 1),
              stats: {
                total: Math.max(0, currentPage.stats.total - 1),
                published: Math.max(
                  0,
                  currentPage.stats.published - Number(record.is_published),
                ),
                drafts: Math.max(
                  0,
                  currentPage.stats.drafts - Number(!record.is_published),
                ),
              },
            },
          };
        });
        setSeries((current) =>
          updateSeriesSessionCounts(
            current,
            record.listening_series_id,
            -1,
            record.is_published ? -1 : 0,
          ),
        );
        setNotice("تم حذف المجلس بنجاح.");
        void refreshSeriesContext(record.listening_series_id);
      }
      setDeleteTarget(null);
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "تعذر تنفيذ الحذف.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const selectedBookUrl = safeMediaUrl(
    selectedSeries?.book_url ??
      selectedSeries?.book_file_url ??
      selectedSeries?.book_source_link,
  );

  return (
    <section className={styles.workspaceStack} dir="rtl">
      <section
        className={styles.metrics}
        aria-label={`ملخص ${dashboardCopy.modules.listening.navigation}`}
      >
        <article>
          <span>إجمالي السلاسل</span>
          <strong>{formatArabicNumber(seriesStats.total)}</strong>
          <small>سلسلة داخل قاعدة البيانات</small>
        </article>
        <article>
          <span>المفعّل للنشر</span>
          <strong>{formatArabicNumber(seriesStats.published)}</strong>
          <small>سلسلة مفعّلة للنشر</small>
        </article>
        <article>
          <span>المسودات</span>
          <strong>{formatArabicNumber(seriesStats.drafts)}</strong>
          <small>سلسلة قيد التجهيز</small>
        </article>
      </section>

      {notice && (
        <div className={styles.workspaceNotice} role="status">
          <span>{notice}</span>
          <button
            type="button"
            aria-label="إخفاء التنبيه"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.workspace}>
        <aside className={styles.workspaceMaster} aria-label="السلاسل">
          <header className={styles.workspacePanelHeader}>
            <div>
              <span className={styles.workspaceEyebrow}>المحتوى الأب</span>
              <h2>السلاسل</h2>
              <p>اختر سلسلة لإدارة مجالسها دون مغادرة الصفحة.</p>
            </div>
            <Button
              onClick={() => openEditor({ kind: "series", record: null })}
            >
              إضافة سلسلة
            </Button>
          </header>

          <div className={styles.workspaceFilters}>
            <label>
              <span>البحث في السلاسل</span>
              <input
                className="ui-input"
                type="search"
                value={seriesSearch}
                placeholder="العنوان أو التصنيف..."
                onChange={(event) => setSeriesSearch(event.target.value)}
              />
            </label>
            <label>
              <span>حالة النشر</span>
              <select
                className="ui-input"
                value={seriesStatus}
                onChange={(event) =>
                  setSeriesStatus(
                    event.target.value as ListeningWorkspaceStatus,
                  )
                }
              >
                <option value="all">كل الحالات</option>
                <option value="published">مفعّل للنشر</option>
                <option value="draft">مسودة</option>
              </select>
            </label>
          </div>

          <div className={styles.workspaceSeriesList}>
            {filteredSeries.length === 0 ? (
              <EmptyState
                title={
                  series.length === 0 ? "لا توجد سلاسل بعد" : "لا توجد نتائج"
                }
                description={
                  series.length === 0
                    ? "أنشئ أول سلسلة، ثم أضف مجالسها من نفس مساحة العمل."
                    : "غيّر عبارة البحث أو حالة النشر."
                }
                action={
                  series.length === 0 ? (
                    <Button
                      onClick={() =>
                        openEditor({ kind: "series", record: null })
                      }
                    >
                      إنشاء أول سلسلة
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              filteredSeries.map((item) => {
                const selected = item.id === selectedSeriesId;
                return (
                  <article
                    key={item.id}
                    className={`${styles.workspaceSeriesCard} ${selected ? styles.workspaceSeriesCardActive : ""}`}
                  >
                    <Link
                      href={`/dashboard/listening?series_id=${item.id}`}
                      aria-current={selected ? "page" : undefined}
                      className={styles.workspaceSeriesLink}
                      onClick={(event) => {
                        event.preventDefault();
                        selectSeries(item.id);
                      }}
                    >
                      <span
                        className={styles.workspaceSeriesMark}
                        aria-hidden="true"
                      >
                        {item.short_title.slice(0, 1)}
                      </span>
                      <span className={styles.workspaceSeriesIdentity}>
                        <strong>{item.title}</strong>
                        <small>
                          {item.category} · {item.period_label}
                        </small>
                      </span>
                      <span
                        className={`${styles.badge} ${item.is_published ? "" : styles.draftBadge}`}
                      >
                        {publicationLabel(item.is_published, item.published_at)}
                      </span>
                    </Link>
                    <div className={styles.workspaceSeriesMeta}>
                      <span>
                        {formatArabicNumber(item.sessions_count)} مجلس
                      </span>
                      <span>
                        {formatArabicNumber(item.published_sessions_count)}{" "}
                        مفعّل
                      </span>
                      <div>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            openEditor({ kind: "series", record: item })
                          }
                        >
                          تعديل
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget({ kind: "series", record: item });
                          }}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </aside>

        <section
          className={styles.workspaceDetail}
          aria-label="تفاصيل السلسلة المحددة"
        >
          {!selectedSeries ? (
            <EmptyState
              title="ابدأ بإنشاء سلسلة سماع"
              description="بعد إنشاء السلسلة ستظهر مجالسها وإجراءاتها هنا."
              action={
                <Button
                  onClick={() => openEditor({ kind: "series", record: null })}
                >
                  إضافة سلسلة
                </Button>
              }
            />
          ) : (
            <>
              <header className={styles.workspaceDetailHero}>
                <div className={styles.workspaceDetailHeading}>
                  <div className={styles.heroBadges}>
                    <span
                      className={`${styles.badge} ${selectedSeries.is_published ? "" : styles.draftBadge}`}
                    >
                      {publicationLabel(
                        selectedSeries.is_published,
                        selectedSeries.published_at,
                      )}
                    </span>
                    <span className={styles.badge}>
                      {selectedSeries.category}
                    </span>
                    <span className={styles.badge}>
                      {selectedSeries.book_source_type
                        ? "كتاب مرتبط"
                        : "بدون كتاب"}
                    </span>
                  </div>
                  <h2>{selectedSeries.title}</h2>
                  <p>{selectedSeries.description}</p>
                  {selectedSeries.is_published &&
                    selectedSeries.published_sessions_count === 0 && (
                      <p
                        className={styles.workspaceAvailabilityWarning}
                        role="note"
                      >
                        السلسلة مفعّلة، لكنها لن تظهر للعامة قبل إتاحة مجلس واحد
                        على الأقل.
                      </p>
                    )}
                </div>
                <div className={styles.workspaceDetailActions}>
                  {selectedBookUrl && (
                    <a
                      href={selectedBookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ui-button ui-button--secondary ui-focus"
                    >
                      فتح الكتاب
                    </a>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() =>
                      openEditor({ kind: "series", record: selectedSeries })
                    }
                  >
                    تعديل السلسلة
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteTarget({
                        kind: "series",
                        record: selectedSeries,
                      });
                    }}
                  >
                    حذف السلسلة
                  </Button>
                </div>
                <dl className={styles.workspaceSeriesStats}>
                  <div>
                    <dt>الفترة</dt>
                    <dd>{selectedSeries.period_label}</dd>
                  </div>
                  <div>
                    <dt>إجمالي المجالس</dt>
                    <dd>{formatArabicNumber(selectedSeries.sessions_count)}</dd>
                  </div>
                  <div>
                    <dt>المفعّل للنشر</dt>
                    <dd>
                      {formatArabicNumber(
                        selectedSeries.published_sessions_count,
                      )}
                    </dd>
                  </div>
                </dl>
              </header>

              <section
                className={styles.workspaceSessions}
                aria-labelledby="workspace-sessions-title"
              >
                <header className={styles.workspaceSessionsHeader}>
                  <div>
                    <span className={styles.workspaceEyebrow}>
                      المحتوى التابع
                    </span>
                    <h3 id="workspace-sessions-title">
                      المجالس والتسجيلات الصوتية
                    </h3>
                    <p>الإضافة والتعديل تتمان داخل السلسلة المفتوحة.</p>
                  </div>
                  <Button
                    disabled={sessionsLoading || Boolean(sessionsError)}
                    onClick={() =>
                      openEditor({ kind: "session", record: null })
                    }
                  >
                    إضافة مجلس
                  </Button>
                </header>

                <div className={styles.workspaceSessionFilters}>
                  <label>
                    <span>البحث في المجالس</span>
                    <input
                      className="ui-input"
                      type="search"
                      value={sessionSearch}
                      placeholder="عنوان المجلس أو التاريخ..."
                      onChange={(event) => setSessionSearch(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>حالة النشر</span>
                    <select
                      className="ui-input"
                      value={sessionStatus}
                      onChange={(event) =>
                        setSessionStatus(
                          event.target.value as ListeningWorkspaceStatus,
                        )
                      }
                    >
                      <option value="all">كل الحالات</option>
                      <option value="published">مفعّل للنشر</option>
                      <option value="draft">مسودة</option>
                    </select>
                  </label>
                </div>

                {sessionsLoading ? (
                  <div
                    className={styles.workspaceLoading}
                    role="status"
                    aria-busy="true"
                  >
                    جارٍ تحميل مجالس السلسلة...
                  </div>
                ) : sessionsError ? (
                  <div className={styles.workspaceError} role="alert">
                    <p>{sessionsError}</p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (selectedSeriesId) {
                          setSessionPages((current) => {
                            const next = { ...current };
                            delete next[selectedSeriesId];
                            return next;
                          });
                          setSessionErrors((current) => {
                            const next = { ...current };
                            delete next[selectedSeriesId];
                            return next;
                          });
                        }
                        setReloadKey((current) => current + 1);
                      }}
                    >
                      إعادة المحاولة
                    </Button>
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <EmptyState
                    title={
                      (selectedSessionPage?.data.length ?? 0) === 0
                        ? "لا توجد مجالس في هذه السلسلة"
                        : "لا توجد نتائج مطابقة"
                    }
                    description={
                      (selectedSessionPage?.data.length ?? 0) === 0
                        ? "أضف أول مجلس وسيُربط تلقائيًا بالسلسلة الحالية."
                        : "غيّر البحث أو حالة النشر."
                    }
                    action={
                      (selectedSessionPage?.data.length ?? 0) === 0 ? (
                        <Button
                          onClick={() =>
                            openEditor({ kind: "session", record: null })
                          }
                        >
                          إضافة أول مجلس
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <ol className={styles.workspaceSessionList}>
                    {filteredSessions.map((session) => (
                      <li key={session.id}>
                        <span className={styles.workspaceSequence}>
                          {formatArabicNumber(session.sequence_number)}
                        </span>
                        <div className={styles.workspaceSessionIdentity}>
                          <div>
                            <strong>{session.title}</strong>
                            <span
                              className={`${styles.badge} ${session.is_published ? "" : styles.draftBadge}`}
                            >
                              {publicationLabel(
                                session.is_published,
                                session.published_at,
                              )}
                            </span>
                          </div>
                          <p>{session.description}</p>
                          <small>
                            {session.date_label} ·{" "}
                            {formatArabicNumber(session.duration_minutes)} دقيقة
                            ·{" "}
                            {session.audio_source_type
                              ? "له تسجيل"
                              : "بدون تسجيل"}
                          </small>
                        </div>
                        <div className={styles.workspaceSessionActions}>
                          <Button
                            variant="secondary"
                            onClick={() =>
                              openEditor({ kind: "session", record: session })
                            }
                          >
                            تعديل
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteTarget({
                                kind: "session",
                                record: session,
                              });
                            }}
                          >
                            حذف
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </>
          )}
        </section>
      </div>

      <Dialog
        open={editor !== null}
        onOpenChange={(open) => !open && closeEditor()}
        title={
          editor?.kind === "series"
            ? editor.record
              ? "تعديل سلسلة السماع"
              : "إضافة سلسلة سماع"
            : editor?.record
              ? "تعديل مجلس السماع"
              : "إضافة مجلس سماع"
        }
        dismissible={!formSubmitting}
        size="wide"
      >
        <div className={styles.workspaceDialogScroll}>
          {editor?.kind === "series" ? (
            <ListeningSeriesForm
              key={`series-${editor.record?.id ?? "new"}`}
              {...(editor.record ? { initial: editor.record } : {})}
              onSaved={handleSeriesSaved}
              onCancel={closeEditor}
              onDirtyChange={setFormDirty}
              onSubmittingChange={setFormSubmitting}
            />
          ) : editor?.kind === "session" && selectedSeries ? (
            <ListeningSessionForm
              key={`session-${editor.record?.id ?? "new"}-${selectedSeries.id}`}
              series={catalog}
              defaultSeriesId={selectedSeries.id}
              defaultSequenceNumber={nextSessionSequence}
              lockedSeries
              {...(editor.record ? { initial: editor.record } : {})}
              onSaved={handleSessionSaved}
              onCancel={closeEditor}
              onDirtyChange={setFormDirty}
              onSubmittingChange={setFormSubmitting}
            />
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
        title={
          deleteTarget?.kind === "series"
            ? "حذف السلسلة نهائيًا"
            : "حذف المجلس نهائيًا"
        }
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
        <div className={styles.dangerMessage} dir="rtl">
          <strong>{deleteTarget?.record.title}</strong>
          <p>
            {deleteTarget?.kind === "series"
              ? "سيُحذف سجل السلسلة وكل مجالسها وملفات الكتاب والصوت المرتبطة بها نهائيًا."
              : "سيُحذف سجل المجلس وملف التسجيل المرفوع نهائيًا."}
          </p>
          {deleteError && <p role="alert">{deleteError}</p>}
        </div>
      </Dialog>
    </section>
  );
}
