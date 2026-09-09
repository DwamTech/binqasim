"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import { PageContainer } from "@/shared/components/layout/page-container";
import {
  Alert,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuItem,
  EmptyState,
  FilterPanel,
  HeroSection,
  Input,
  LoadingState,
  Select,
} from "@/shared/components/ui";

import {
  deletePage,
  listPages,
  pageLifecycle,
} from "../application/pages.client";
import { canManagePages } from "../application/pages.permissions";
import {
  pageStatusLabels,
  type PageList,
  type PageListItem,
} from "../domain/pages.contracts";
import { PagesConfirmDialog } from "./pages-confirm-dialog";
import { PagesIcon } from "./pages-icons";
import styles from "./pages.module.css";

type LifecycleAction = "publish" | "archive" | "restore-from-archive";
type PageAction = LifecycleAction | "delete";
type PendingConfirmation = { item: PageListItem; action: PageAction };

function formatDate(value: string | null): string {
  return value
    ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "—";
}

const actionCopy: Record<
  PageAction,
  { title: string; body: string; label: string; destructive?: boolean }
> = {
  publish: {
    title: "نشر المسودة المحفوظة؟",
    body: "سيصبح محتوى آخر مسودة محفوظة متاحًا للعامة.",
    label: "نشر الصفحة",
  },
  archive: {
    title: "أرشفة الصفحة؟",
    body: "ستتوقف الصفحة عن الظهور للعامة، مع بقاء سجل المراجعات محفوظًا.",
    label: "أرشفة الصفحة",
    destructive: true,
  },
  "restore-from-archive": {
    title: "استعادة الصفحة؟",
    body: "ستعود الصفحة من الأرشيف دون نشر مسودة جديدة تلقائيًا.",
    label: "استعادة الصفحة",
  },
  delete: {
    title: "حذف الصفحة؟",
    body: "ستُحذف الصفحة من لوحة الإدارة والموقع. لا يمكن حذف صفحة لها صفحات فرعية.",
    label: "حذف الصفحة",
    destructive: true,
  },
};

export function PagesListView({ actor }: { actor: AdminSummary }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const query = useMemo(() => new URLSearchParams(queryString), [queryString]);
  const [searchInput, setSearchInput] = useState(query.get("search") ?? "");
  const [result, setResult] = useState<PageList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<PendingConfirmation | null>(
    null,
  );
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    void listPages(query)
      .then((next) => active && setResult(next))
      .catch(() => active && setError("تعذر تحميل الصفحات. حاول مرة أخرى."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [query, reloadKey]);

  function change(next: Record<string, string | undefined>) {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams(query);
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (!("page" in next)) params.delete("page");
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`);
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    change({ search: searchInput.trim() || undefined });
  }

  async function performAction(item: PageListItem, action: PageAction) {
    setPending(`${item.id}-${action}`);
    setError(null);
    try {
      if (action === "delete") await deletePage(String(item.id));
      else await pageLifecycle(String(item.id), action);
      setConfirmation(null);
      setReloadKey((value) => value + 1);
    } catch {
      setError(
        action === "delete"
          ? "تعذر حذف الصفحة. انقل أو احذف أي صفحات فرعية أولًا ثم حاول مرة أخرى."
          : "تعذر تحديث حالة الصفحة. لم تُجرَ أي تغييرات.",
      );
    } finally {
      setPending(null);
    }
  }

  const filtered = Boolean(query.get("search") || query.get("status"));
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة المحتوى"
          title="الصفحات"
          description="أنشئ الصفحات، راجع مسوداتها، وانشر المحتوى المعتمد بأمان."
          actions={
            canManagePages(actor, "pages.create") ? (
              <Link
                className="ui-button ui-button--primary ui-focus"
                href="/dashboard/pages/new"
              >
                <PagesIcon name="add" />
                إنشاء صفحة
              </Link>
            ) : undefined
          }
        />
      }
    >
      <div className={styles.stack} dir="rtl">
        <FilterPanel
          title="البحث والتصفية"
          description="ابحث بالعنوان أو المسار، ثم صفِّ النتائج حسب حالة النشر."
        >
          <form className={styles.filters} onSubmit={submitSearch}>
            <label className={styles.searchField}>
              <span>البحث</span>
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="العنوان أو المسار"
              />
            </label>
            <label>
              <span>الحالة</span>
              <Select
                value={query.get("status") ?? ""}
                options={[
                  { value: "", label: "كل الحالات" },
                  { value: "draft", label: "مسودة" },
                  { value: "published", label: "منشورة" },
                  { value: "archived", label: "مؤرشفة" },
                ]}
                onValueChange={(status) =>
                  change({ status: status || undefined })
                }
              />
            </label>
            <div className={styles.filterActions}>
              <Button type="submit" variant="secondary" disabled={loading}>
                <PagesIcon name="search" />
                بحث
              </Button>
              {filtered && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSearchInput("");
                    change({ search: undefined, status: undefined });
                  }}
                >
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </form>
        </FilterPanel>

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
        {loading && <LoadingState label="جارٍ تحميل الصفحات…" />}
        {!loading && result?.data.length === 0 && (
          <EmptyState
            title={filtered ? "لا توجد نتائج مطابقة" : "لا توجد صفحات بعد"}
            description={
              filtered
                ? "جرّب تغيير البحث أو حالة الصفحة."
                : "ابدأ بإنشاء أول صفحة للموقع."
            }
            action={
              canManagePages(actor, "pages.create") ? (
                <Link
                  className="ui-button ui-button--primary ui-focus"
                  href="/dashboard/pages/new"
                >
                  إنشاء صفحة
                </Link>
              ) : undefined
            }
          />
        )}
        {result && result.data.length > 0 && (
          <div>
            <section className={styles.tableShell} aria-label="قائمة الصفحات">
              <div className={styles.tableHeading}>
                <div>
                  <h2>قائمة الصفحات</h2>
                  <p>الحالة والمسار وآخر التغييرات في مكان واحد.</p>
                </div>
                <span>{result.meta.total} صفحة</span>
              </div>
              <div className="ui-responsive-table-wrap" tabIndex={0}>
                <table className={`${styles.table} ui-responsive-table`}>
                  <thead>
                    <tr>
                      <th scope="col">الصفحة</th>
                      <th scope="col">الحالة</th>
                      <th scope="col">النشر</th>
                      <th scope="col">آخر تحديث</th>
                      <th scope="col">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((item, index) => (
                      <tr key={item.id}>
                        <td data-label="الصفحة">
                          <div className={styles.pageIdentity}>
                            <strong>{item.title}</strong>
                            <small className={styles.path}>
                              /pages/{item.path}
                            </small>
                          </div>
                        </td>
                        <td data-label="الحالة">
                          <div className={styles.badgeRow}>
                            <Badge
                              variant={
                                item.status === "published"
                                  ? "success"
                                  : item.status === "archived"
                                    ? "danger"
                                    : "warning"
                              }
                            >
                              {pageStatusLabels[item.status]}
                            </Badge>
                            {item.has_unpublished_changes && (
                              <Badge variant="warning">
                                تغييرات غير منشورة
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td data-label="النشر">
                          {formatDate(item.published_at)}
                        </td>
                        <td data-label="آخر تحديث">
                          {formatDate(item.updated_at)}
                        </td>
                        <td data-label="الإجراءات">
                          <div className={styles.rowActions}>
                            <Link
                              className="ui-button ui-button--primary ui-focus"
                              href={`/dashboard/pages/${item.id}`}
                            >
                              <PagesIcon name="edit" />
                              فتح المحرر
                            </Link>
                            <DropdownMenu
                              direction={
                                index >= result.data.length - 2 &&
                                result.data.length > 2
                                  ? "up"
                                  : "down"
                              }
                              trigger={
                                <>
                                  <PagesIcon name="more" />
                                  المزيد
                                </>
                              }
                            >
                              {item.status === "published" && (
                                <a
                                  role="menuitem"
                                  className="ui-menu-item ui-focus"
                                  href={item.public_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <PagesIcon name="external" />
                                  فتح الصفحة العامة
                                </a>
                              )}
                              <DropdownMenuItem
                                onSelect={() =>
                                  router.push(
                                    `/dashboard/pages/${item.id}/revisions`,
                                  )
                                }
                              >
                                <PagesIcon name="history" />
                                سجل المراجعات
                              </DropdownMenuItem>
                              {item.status !== "archived" &&
                                item.has_unpublished_changes &&
                                canManagePages(actor, "pages.publish") && (
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      setConfirmation({
                                        item,
                                        action: "publish",
                                      })
                                    }
                                  >
                                    <PagesIcon name="publish" />
                                    نشر المسودة
                                  </DropdownMenuItem>
                                )}
                              {item.status !== "archived" &&
                                canManagePages(actor, "pages.archive") && (
                                  <DropdownMenuItem
                                    className={styles.dangerText ?? ""}
                                    onSelect={() =>
                                      setConfirmation({
                                        item,
                                        action: "archive",
                                      })
                                    }
                                  >
                                    <PagesIcon name="archive" />
                                    أرشفة
                                  </DropdownMenuItem>
                                )}
                              {item.status === "archived" &&
                                canManagePages(actor, "pages.restore") && (
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      setConfirmation({
                                        item,
                                        action: "restore-from-archive",
                                      })
                                    }
                                  >
                                    <PagesIcon name="history" />
                                    استعادة
                                  </DropdownMenuItem>
                                )}
                              {canManagePages(actor, "pages.delete") && (
                                <DropdownMenuItem
                                  className={styles.dangerText ?? ""}
                                  onSelect={() =>
                                    setConfirmation({ item, action: "delete" })
                                  }
                                >
                                  <PagesIcon name="trash" />
                                  حذف الصفحة
                                </DropdownMenuItem>
                              )}
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <nav className={styles.pagination} aria-label="ترقيم صفحات الإدارة">
              <Button
                variant="secondary"
                disabled={!result.links.prev || loading}
                onClick={() =>
                  change({ page: String(result.meta.current_page - 1) })
                }
              >
                السابق
              </Button>
              <span>
                صفحة {result.meta.current_page} من {result.meta.last_page}
              </span>
              <Button
                variant="secondary"
                disabled={!result.links.next || loading}
                onClick={() =>
                  change({ page: String(result.meta.current_page + 1) })
                }
              >
                التالي
              </Button>
            </nav>
          </div>
        )}
        {confirmation && (
          <PagesConfirmDialog
            open
            title={actionCopy[confirmation.action].title}
            confirmLabel={actionCopy[confirmation.action].label}
            destructive={actionCopy[confirmation.action].destructive}
            loading={pending !== null}
            onCancel={() => setConfirmation(null)}
            onConfirm={() =>
              void performAction(confirmation.item, confirmation.action)
            }
          >
            <p>{actionCopy[confirmation.action].body}</p>
          </PagesConfirmDialog>
        )}
      </div>
    </PageContainer>
  );
}
