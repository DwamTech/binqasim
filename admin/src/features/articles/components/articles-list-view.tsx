"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import {
  Button,
  Dialog,
  EmptyState,
  ErrorState,
  HeroSection,
  Select,
  Skeleton,
} from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { PageContainer } from "@/shared/components/layout/page-container";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import {
  deleteArticle,
  getArticleCatalogs,
  listArticles,
  toggleArticleStatus,
} from "../articles.client";
import {
  formatArticleDate,
  type Article,
  type ArticleCatalogs,
  type ArticlePage,
} from "../articles.contracts";
import {
  canCreateArticle,
  canDeleteArticle,
  canEditArticle,
  canToggleArticleStatus,
} from "../articles.permissions";
import { articleQueryParams, normalizeArticleQuery } from "../articles.query";
import { ArticleStatusBadge } from "./article-status-badge";
import styles from "./articles.module.css";

export function ArticlesListView({ actor }: { actor: AdminSummary }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(
    () =>
      normalizeArticleQuery({
        search: searchParams.get("search") ?? undefined,
        section_id: searchParams.get("section_id") ?? undefined,
        status: searchParams.get("status") ?? undefined,
        author: searchParams.get("author") ?? undefined,
        date: searchParams.get("date") ?? undefined,
        page: searchParams.get("page") ?? undefined,
        per_page: searchParams.get("per_page") ?? undefined,
      }),
    [searchParams],
  );
  const [search, setSearch] = useState(query.search ?? "");
  const [page, setPage] = useState<ArticlePage | null>(null);
  const [catalogs, setCatalogs] = useState<ArticleCatalogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [statusTarget, setStatusTarget] = useState<Article | null>(null);
  const [pendingAction, setPendingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    searchParams.get("notice") === "deleted"
      ? `تم حذف ${dashboardCopy.modules.articles.singular} بنجاح.`
      : null,
  );

  const setQuery = useCallback(
    (changes: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("notice");
      Object.entries(changes).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      setLoading(true);
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
    void listArticles(query, controller.signal)
      .then((result) => {
        if (active) setPage(result);
      })
      .catch((reason: unknown) => {
        if (
          active &&
          !(reason instanceof DOMException && reason.name === "AbortError")
        )
          setError(
            reason instanceof Error ? reason.message : "تعذر تحميل المقالات.",
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

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void getArticleCatalogs(controller.signal)
      .then((result) => {
        if (active) setCatalogs(result);
      })
      .catch(() => {
        if (active) setCatalogError(true);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  async function confirmDelete() {
    if (!deleteTarget || pendingAction) return;
    setPendingAction(true);
    setActionError(null);
    try {
      await deleteArticle(deleteTarget.id);
      setDeleteTarget(null);
      setNotice(`تم حذف ${dashboardCopy.modules.articles.singular} بنجاح.`);
      setReloadKey((value) => value + 1);
    } catch (reason) {
      setActionError(
        reason instanceof Error
          ? reason.message
          : `تعذر حذف ${dashboardCopy.modules.articles.singular}.`,
      );
    } finally {
      setPendingAction(false);
    }
  }

  async function confirmStatus() {
    if (!statusTarget || pendingAction) return;
    setPendingAction(true);
    setActionError(null);
    try {
      await toggleArticleStatus(statusTarget.id);
      setStatusTarget(null);
      setNotice("تم تحديث حالة المقال.");
      setReloadKey((value) => value + 1);
    } catch (reason) {
      setActionError(
        reason instanceof Error ? reason.message : "تعذر تحديث الحالة.",
      );
    } finally {
      setPendingAction(false);
    }
  }

  const filtered = articleQueryParams(query).size > 0;

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة المحتوى"
          title={dashboardCopy.modules.articles.pages.list}
          description="ابحث وصفِّ المقالات، وراجع حالات النشر والوسائط من مكان واحد."
          actions={
            canCreateArticle(actor) ? (
              <Link
                className="ui-button ui-button--primary ui-focus"
                href="/dashboard/articles/new"
              >
                {dashboardCopy.modules.articles.pages.create}
              </Link>
            ) : undefined
          }
        />
      }
    >
      {notice && (
        <div className={styles.notice} role="status">
          {notice}
        </div>
      )}
      <section className={styles.filters} aria-label="بحث وفلاتر المقالات">
        <label className={styles.searchField}>
          <span>البحث</span>
          <div>
            <input
              className="ui-input"
              type="search"
              value={search}
              maxLength={255}
              placeholder="العنوان أو Slug…"
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
          <span>القسم</span>
          <Select
            value={query.section_id ?? ""}
            aria-label="فلتر القسم"
            options={[
              { value: "", label: "كل الأقسام" },
              ...(catalogs?.sections ?? []).map((section) => ({
                value: section.id,
                label: section.name,
              })),
            ]}
            onValueChange={(value) =>
              setQuery({ section_id: value || undefined, page: undefined })
            }
          />
        </label>
        <label>
          <span>الحالة</span>
          <Select
            value={query.status ?? ""}
            aria-label="فلتر الحالة"
            options={[
              { value: "", label: "كل الحالات" },
              { value: "draft", label: "مسودة" },
              { value: "scheduled", label: "مجدول" },
              { value: "published", label: "منشور" },
              { value: "archived", label: "مؤرشف" },
            ]}
            onValueChange={(value) =>
              setQuery({ status: value || undefined, page: undefined })
            }
          />
        </label>
        <label>
          <span>الكاتب</span>
          <Select
            value={query.author ?? ""}
            aria-label="فلتر الكاتب"
            options={[
              { value: "", label: "كل الكتّاب" },
              ...(catalogs?.authors ?? []).map((author) => ({
                value: author.id,
                label: author.name,
              })),
            ]}
            onValueChange={(value) =>
              setQuery({ author: value || undefined, page: undefined })
            }
          />
        </label>
        <label>
          <span>التاريخ</span>
          <input
            className="ui-input"
            type="date"
            value={query.date ?? ""}
            onChange={(event) =>
              setQuery({
                date: event.target.value || undefined,
                page: undefined,
              })
            }
          />
        </label>
        <label>
          <span>لكل صفحة</span>
          <Select
            value={String(query.per_page)}
            aria-label="عدد المقالات لكل صفحة"
            options={[10, 20, 50, 100].map((value) => ({
              value: String(value),
              label: String(value),
            }))}
            onValueChange={(value) =>
              setQuery({
                per_page: value === "20" ? undefined : value,
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
              router.replace(pathname);
            }}
          >
            إعادة ضبط الفلاتر
          </Button>
        )}
      </section>
      {catalogError && (
        <p className={styles.catalogWarning}>
          تعذر تحميل قوائم الأقسام والكتّاب؛ ما زال البحث وبقية الفلاتر متاحًا.
        </p>
      )}

      {loading ? (
        <div className={styles.skeletonList}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : error ? (
        <ErrorState
          title="تعذر تحميل المقالات"
          description={error}
          onRetry={() => {
            setLoading(true);
            setError(null);
            setReloadKey((value) => value + 1);
          }}
        />
      ) : !page || page.data.length === 0 ? (
        <EmptyState
          title={filtered ? "لا توجد نتائج مطابقة" : "لا توجد مقالات بعد"}
          description={
            filtered
              ? "غيّر البحث أو الفلاتر للوصول إلى نتائج أخرى."
              : "ابدأ بإضافة أول مقال إلى لوحة التحكم."
          }
          action={
            filtered ? (
              <Button
                variant="secondary"
                onClick={() => router.replace(pathname)}
              >
                مسح الفلاتر
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div
            className={`${styles.tableWrap} ui-responsive-table-wrap`}
            tabIndex={0}
            role="region"
            aria-label="جدول المقالات"
          >
            <table className={`${styles.table} ui-responsive-table`}>
              <thead>
                <tr>
                  <th>المقال</th>
                  <th>القسم</th>
                  <th>الكاتب</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {page.data.map((article) => (
                  <tr key={article.id}>
                    <td data-label="المقال">
                      <strong className={styles.longText}>
                        {article.title}
                      </strong>
                      <code className={styles.slug}>{article.slug}</code>
                    </td>
                    <td data-label="القسم">
                      {article.section?.name ?? "بدون قسم"}
                    </td>
                    <td data-label="الكاتب">
                      {article.author?.name ??
                        article.author_name ??
                        "غير محدد"}
                    </td>
                    <td data-label="الحالة">
                      <ArticleStatusBadge status={article.status} />
                    </td>
                    <td data-label="التاريخ">
                      {formatArticleDate(
                        article.published_at ?? article.created_at,
                      )}
                    </td>
                    <td data-label="الإجراءات">
                      <div className={styles.actions}>
                        <Link
                          className="ui-button ui-button--secondary ui-focus"
                          href={`/dashboard/articles/${article.id}`}
                        >
                          عرض
                        </Link>
                        {canEditArticle(actor, article) && (
                          <Link
                            className="ui-button ui-button--secondary ui-focus"
                            href={`/dashboard/articles/${article.id}/edit`}
                          >
                            تعديل
                          </Link>
                        )}
                        {canToggleArticleStatus(actor) && (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setActionError(null);
                              setStatusTarget(article);
                            }}
                          >
                            تغيير الحالة
                          </Button>
                        )}
                        {canDeleteArticle(actor, article) && (
                          <Button
                            variant="danger"
                            onClick={() => {
                              setActionError(null);
                              setDeleteTarget(article);
                            }}
                          >
                            حذف
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className={styles.pagination} aria-label="ترقيم صفحات المقالات">
            <Button
              variant="secondary"
              disabled={page.meta.current_page <= 1}
              onClick={() =>
                setQuery({ page: String(page.meta.current_page - 1) })
              }
            >
              السابق
            </Button>
            <span>
              صفحة {formatArabicNumber(page.meta.current_page)} من{" "}
              {formatArabicNumber(page.meta.last_page)} —{" "}
              {formatArabicNumber(page.meta.total)} مقال
            </span>
            <Button
              variant="secondary"
              disabled={page.meta.current_page >= page.meta.last_page}
              onClick={() =>
                setQuery({ page: String(page.meta.current_page + 1) })
              }
            >
              التالي
            </Button>
          </nav>
        </>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) =>
          !open && !pendingAction && setDeleteTarget(null)
        }
        title={`تأكيد حذف ${dashboardCopy.modules.articles.singular}`}
        dismissible={!pendingAction}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={pendingAction}
              onClick={() => setDeleteTarget(null)}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              loading={pendingAction}
              disabled={pendingAction}
              onClick={() => void confirmDelete()}
            >
              حذف {dashboardCopy.modules.articles.singular}
            </Button>
          </div>
        }
      >
        <p>
          سيُحذف المقال <strong>{deleteTarget?.title}</strong> حذفًا مرنًا، ولن
          تظهر بياناته في القائمة العادية.
        </p>
        {actionError && (
          <p role="alert" className={styles.errorText}>
            {actionError}
          </p>
        )}
      </Dialog>
      <Dialog
        open={statusTarget !== null}
        onOpenChange={(open) =>
          !open && !pendingAction && setStatusTarget(null)
        }
        title="تغيير حالة المقال"
        dismissible={!pendingAction}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={pendingAction}
              onClick={() => setStatusTarget(null)}
            >
              إلغاء
            </Button>
            <Button
              loading={pendingAction}
              disabled={pendingAction}
              onClick={() => void confirmStatus()}
            >
              تأكيد التغيير
            </Button>
          </div>
        }
      >
        <p>
          سيؤثر هذا الإجراء على إتاحة المقال{" "}
          <strong>{statusTarget?.title}</strong> للعامة. سيتم اعتماد النتيجة
          الفعلية من الخادم.
        </p>
        {actionError && (
          <p role="alert" className={styles.errorText}>
            {actionError}
          </p>
        )}
      </Dialog>
    </PageContainer>
  );
}
