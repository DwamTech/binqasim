"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import { PageContainer } from "@/shared/components/layout/page-container";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  HeroSection,
  LoadingState,
} from "@/shared/components/ui";

import { canManagePages } from "../application/pages.permissions";
import {
  getPage,
  getPageRevision,
  listPageRevisions,
  PagesClientError,
  restorePageRevision,
} from "../application/pages.client";
import type {
  PageDetail,
  PageRevisionDetail,
  PageRevisionList,
  PageRevisionSummary,
} from "../domain/pages.contracts";
import { componentDefinition } from "./page-component-catalog";
import { PagesConfirmDialog } from "./pages-confirm-dialog";
import { PagesIcon } from "./pages-icons";
import styles from "./pages.module.css";

function formatDate(value: string | null | undefined): string {
  return value
    ? new Intl.DateTimeFormat("ar-SA", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
}

function revisionState(revision: PageRevisionSummary) {
  if (revision.is_current_draft && revision.is_current_published)
    return { label: "المسودة والمنشور الحالي", variant: "success" as const };
  if (revision.is_current_draft)
    return { label: "المسودة الحالية", variant: "warning" as const };
  if (revision.is_current_published)
    return { label: "النسخة المنشورة الحالية", variant: "success" as const };
  if (revision.was_published)
    return { label: "نُشرت سابقًا", variant: "default" as const };
  return { label: "نسخة تاريخية", variant: "default" as const };
}

function seoSummary(detail: PageRevisionDetail) {
  if (Array.isArray(detail.seo)) return null;
  return {
    title: typeof detail.seo.title === "string" ? detail.seo.title : "—",
    description:
      typeof detail.seo.description === "string" ? detail.seo.description : "—",
    canonical:
      typeof detail.seo.canonical === "string" ? detail.seo.canonical : "—",
    index:
      typeof detail.seo.index === "boolean"
        ? detail.seo.index
          ? "مسموح"
          : "ممنوع"
        : "افتراضي",
  };
}

export function RevisionHistory({
  id,
  actor,
}: {
  id: string;
  actor: AdminSummary;
}) {
  const [page, setPage] = useState<PageDetail | null>(null);
  const [list, setList] = useState<PageRevisionList | null>(null);
  const [detail, setDetail] = useState<PageRevisionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [restoreTarget, setRestoreTarget] =
    useState<PageRevisionSummary | null>(null);
  const [restoring, setRestoring] = useState(false);
  const canRestore = canManagePages(actor, "pages.update");

  useEffect(() => {
    let active = true;
    void Promise.all([getPage(id), listPageRevisions(id, pageNumber)])
      .then(([nextPage, nextList]) => {
        if (!active) return;
        setPage(nextPage);
        setList(nextList);
      })
      .catch(() => active && setError("تعذر تحميل سجل المراجعات."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, pageNumber, reloadKey]);

  async function viewRevision(revision: PageRevisionSummary) {
    setDetailLoading(true);
    setError(null);
    try {
      setDetail(await getPageRevision(id, String(revision.id)));
    } catch {
      setError("تعذر تحميل تفاصيل المراجعة.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function restore() {
    if (!restoreTarget || restoring) return;
    setRestoring(true);
    setError(null);
    try {
      await restorePageRevision(id, String(restoreTarget.id));
      window.location.assign(`/dashboard/pages/${id}`);
    } catch (reason) {
      setError(
        reason instanceof PagesClientError
          ? reason.message
          : "تعذر إنشاء المسودة المستعادة.",
      );
      setRestoreTarget(null);
    } finally {
      setRestoring(false);
    }
  }

  if (loading && !list)
    return (
      <PageContainer>
        <LoadingState label="جارٍ تحميل سجل المراجعات…" />
      </PageContainer>
    );
  const seo = detail ? seoSummary(detail) : null;
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة الصفحات"
          title="سجل المراجعات"
          description={
            page
              ? `تتبّع النسخ المحفوظة لصفحة «${page.title}» واستعد أي نسخة كمسودة جديدة.`
              : "راجع النسخ المحفوظة للصفحة."
          }
          actions={
            <Link
              className="ui-button ui-button--secondary ui-focus"
              href={`/dashboard/pages/${id}`}
            >
              العودة إلى المحرر
            </Link>
          }
        />
      }
    >
      <div className={styles.stack} dir="rtl">
        {page && (
          <div className={styles.statusStrip}>
            <Badge
              variant={
                page.status === "published"
                  ? "success"
                  : page.status === "archived"
                    ? "danger"
                    : "warning"
              }
            >
              {page.status === "published"
                ? "منشورة"
                : page.status === "archived"
                  ? "مؤرشفة"
                  : "مسودة"}
            </Badge>
            <span>المسودة الحالية: النسخة {page.draft.version}</span>
            <span>
              {page.published
                ? `المنشور الحالي: النسخة ${page.published.version}`
                : "لم تُنشر بعد"}
            </span>
          </div>
        )}
        {error && (
          <Alert variant="error" title="تعذر إكمال الطلب">
            {error}
            <div className={styles.actions}>
              <Button
                variant="secondary"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  setReloadKey((value) => value + 1);
                }}
              >
                إعادة المحاولة
              </Button>
            </div>
          </Alert>
        )}
        {loading && list && <LoadingState label="جارٍ تحديث سجل المراجعات…" />}
        {!loading && list?.data.length === 0 && (
          <EmptyState
            title="لا توجد مراجعات"
            description="ستظهر النسخ المحفوظة هنا بعد حفظ المسودة."
          />
        )}
        {list && list.data.length > 0 && (
          <section className={styles.historyPanel}>
            <div className={styles.historyHeader}>
              <div>
                <h2>النسخ المحفوظة</h2>
                <p>{list.meta.total} مراجعة محفوظة دون تعديل التاريخ السابق.</p>
              </div>
            </div>
            <div className={styles.historyList}>
              {list.data.map((revision) => {
                const state = revisionState(revision);
                return (
                  <article className={styles.historyRow} key={revision.id}>
                    <div>
                      <div className={styles.badgeRow}>
                        <strong>
                          النسخة {revision.version} — {revision.title}
                        </strong>
                        <Badge variant={state.variant}>{state.label}</Badge>
                      </div>
                      <div className={styles.historyMeta}>
                        <span>أُنشئت: {formatDate(revision.created_at)}</span>
                        {revision.published_at && (
                          <span>
                            نُشرت: {formatDate(revision.published_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <Button
                        variant="secondary"
                        loading={detailLoading && detail?.id === revision.id}
                        onClick={() => void viewRevision(revision)}
                      >
                        <PagesIcon name="preview" />
                        عرض التفاصيل
                      </Button>
                      {canRestore && !revision.is_current_draft && (
                        <Button
                          variant="secondary"
                          onClick={() => setRestoreTarget(revision)}
                        >
                          <PagesIcon name="history" />
                          استعادة كمسودة جديدة
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <nav className={styles.pagination} aria-label="ترقيم سجل المراجعات">
              <Button
                variant="secondary"
                disabled={pageNumber <= 1 || loading}
                onClick={() => {
                  setLoading(true);
                  setPageNumber((value) => Math.max(1, value - 1));
                }}
              >
                السابق
              </Button>
              <span>
                صفحة {list.meta.current_page} من {list.meta.last_page}
              </span>
              <Button
                variant="secondary"
                disabled={pageNumber >= list.meta.last_page || loading}
                onClick={() => {
                  setLoading(true);
                  setPageNumber((value) => value + 1);
                }}
              >
                التالي
              </Button>
            </nav>
          </section>
        )}
        {detail && (
          <aside
            className={styles.detailPanel}
            aria-label={`تفاصيل النسخة ${detail.version}`}
          >
            <div className={styles.detailHeader}>
              <div>
                <h2>تفاصيل النسخة {detail.version}</h2>
                <p>عرض للقراءة فقط؛ لن يؤدي فتح التفاصيل إلى تعديل أي محتوى.</p>
              </div>
              <Button variant="secondary" onClick={() => setDetail(null)}>
                إغلاق التفاصيل
              </Button>
            </div>
            <div className={styles.readOnlyGrid}>
              <div className={styles.readOnlyField}>
                <span>العنوان</span>
                <strong>{detail.title}</strong>
              </div>
              <div className={styles.readOnlyField}>
                <span>تاريخ الإنشاء</span>
                <strong>{formatDate(detail.created_at)}</strong>
              </div>
              <div className={styles.readOnlyField}>
                <span>الأقسام</span>
                <strong>
                  {detail.content.sections.length
                    ? detail.content.sections
                        .map(
                          (section) => componentDefinition(section.type).label,
                        )
                        .join("، ")
                    : "بلا أقسام"}
                </strong>
              </div>
              <div className={styles.readOnlyField}>
                <span>الوسائط المرتبطة</span>
                <strong>{Object.keys(detail.media).length}</strong>
              </div>
            </div>
            <section>
              <h3>ملخص SEO</h3>
              {seo ? (
                <div className={styles.readOnlyGrid}>
                  <div className={styles.readOnlyField}>
                    <span>عنوان نتائج البحث</span>
                    <strong>{seo.title}</strong>
                  </div>
                  <div className={styles.readOnlyField}>
                    <span>الوصف</span>
                    <strong>{seo.description}</strong>
                  </div>
                  <div className={styles.readOnlyField}>
                    <span>الرابط الأساسي</span>
                    <strong className={styles.path}>{seo.canonical}</strong>
                  </div>
                  <div className={styles.readOnlyField}>
                    <span>الفهرسة</span>
                    <strong>{seo.index}</strong>
                  </div>
                </div>
              ) : (
                <Alert>بيانات SEO قديمة محفوظة كما هي داخل هذه المراجعة.</Alert>
              )}
            </section>
            {Object.keys(detail.media).length > 0 && (
              <section>
                <h3>الوسائط</h3>
                <div className={styles.mediaLinks}>
                  {Object.values(detail.media).map((item) => (
                    <a
                      className="ui-button ui-button--secondary ui-focus"
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <PagesIcon
                        name={item.type === "document" ? "document" : item.type}
                      />
                      {item.name}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </aside>
        )}
        {restoreTarget && (
          <PagesConfirmDialog
            open
            title="استعادة المراجعة كمسودة جديدة؟"
            confirmLabel="إنشاء مسودة جديدة"
            loading={restoring}
            onCancel={() => setRestoreTarget(null)}
            onConfirm={() => void restore()}
          >
            <p>
              سيتم إنشاء مسودة جديدة من النسخة {restoreTarget.version}. يظل سجل
              المراجعات كما هو، ولن تتغير الصفحة المنشورة حاليًا حتى تنشر
              المسودة الجديدة.
            </p>
          </PagesConfirmDialog>
        )}
      </div>
    </PageContainer>
  );
}

// Regression contract: Restore as New Draft. Existing history will remain unchanged. Published page will not change.
