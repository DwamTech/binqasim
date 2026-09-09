"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  EmptyState,
  ErrorState,
  FilterPanel,
  HeroSection,
  Select,
  Skeleton,
} from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { PageContainer } from "@/shared/components/layout/page-container";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import {
  formatSectionDate,
  getSectionModuleLabel,
  managedSectionModules,
  normalizeSectionQuery,
  sectionModuleLabels,
  type Section,
  type SectionPage,
} from "../sections.contracts";
import {
  deleteSection,
  listSections,
  SectionsClientError,
} from "../sections.client";
import { DeleteSectionDialog } from "./delete-section-dialog";
import styles from "./sections.module.css";

export function SectionsListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(
    () =>
      normalizeSectionQuery({
        search: searchParams.get("search") ?? undefined,
        module: searchParams.get("module") ?? undefined,
        page: searchParams.get("page") ?? undefined,
      }),
    [searchParams],
  );
  const [search, setSearch] = useState(query.search ?? "");
  const [page, setPage] = useState<SectionPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    searchParams.get("notice") === "deleted"
      ? `تم حذف ${dashboardCopy.modules.sections.singular} بنجاح.`
      : null,
  );

  const setUrlQuery = useCallback(
    (changes: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const serialized = next.toString();
      router.replace(serialized ? `${pathname}?${serialized}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (search.trim() === (query.search ?? "")) return;
    const timer = window.setTimeout(
      () =>
        setUrlQuery({
          search: search.trim() || undefined,
          page: undefined,
        }),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [query.search, search, setUrlQuery]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await listSections(query, controller.signal);
        if (active) setPage(result);
      } catch (reason) {
        if (active)
          setError(
            reason instanceof Error ? reason.message : "تعذر تحميل الأقسام.",
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

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSection(deleteTarget.id);
      setDeleteTarget(null);
      setNotice(`تم حذف ${dashboardCopy.modules.sections.singular} بنجاح.`);
      setReloadKey((value) => value + 1);
    } catch (reason) {
      setDeleteError(
        reason instanceof SectionsClientError
          ? reason.message
          : `تعذر حذف ${dashboardCopy.modules.sections.singular}.`,
      );
    } finally {
      setDeleting(false);
    }
  }

  const filtered = Boolean(query.search || query.module);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة المحتوى"
          title={dashboardCopy.modules.sections.pages.list}
          description="نظّم أقسام المقالات والكتب والمرئيات وحدد مكان ظهور كل قسم."
          actions={
            <Link
              className="ui-button ui-button--primary"
              href="/dashboard/sections/new"
            >
              {dashboardCopy.modules.sections.pages.create}
            </Link>
          }
        />
      }
    >
      {notice && (
        <div className={styles.successNotice} role="status">
          {notice}
        </div>
      )}
      <FilterPanel
        className={styles.filterPanel ?? ""}
        title="تصفية الأقسام"
        description="ابحث بالاسم أو اختر الموديول للوصول إلى القسم بسرعة."
        aria-label="بحث وفلاتر الأقسام"
      >
        <div className={styles.filters}>
          <label className={styles.searchField}>
            <span>البحث بالاسم</span>
            <div>
              <input
                className="ui-input"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث عن قسم…"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="مسح البحث"
                >
                  ×
                </button>
              )}
            </div>
          </label>
          <label>
            <span>الموديول</span>
            <Select
              value={query.module ?? ""}
              aria-label="اختيار الموديول"
              options={[
                { value: "", label: "كل الموديولات" },
                ...managedSectionModules.map((module) => ({
                  value: module,
                  label: sectionModuleLabels[module],
                })),
              ]}
              onValueChange={(value) =>
                setUrlQuery({
                  module: value || undefined,
                  page: undefined,
                })
              }
            />
          </label>
          <button
            className="ui-button ui-button--secondary"
            type="button"
            disabled={!filtered}
            onClick={() => {
              setSearch("");
              router.replace(pathname);
            }}
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      </FilterPanel>

      {loading ? (
        <div className={styles.loadingTable} aria-label="جارٍ تحميل الأقسام">
          <Skeleton style={{ blockSize: "3.2rem" }} />
          <Skeleton style={{ blockSize: "14rem" }} />
        </div>
      ) : error ? (
        <ErrorState
          title="تعذر تحميل الأقسام"
          description={error}
          onRetry={() => setReloadKey((value) => value + 1)}
        />
      ) : !page || page.data.length === 0 ? (
        <EmptyState
          title={filtered ? "لا توجد نتائج مطابقة" : "لا توجد أقسام بعد"}
          description={
            filtered
              ? "غيّر عبارة البحث أو أعد ضبط الفلاتر."
              : "ابدأ بإنشاء أول قسم وربطه بموديول المحتوى المناسب."
          }
          action={
            filtered ? (
              <button
                className="ui-button ui-button--secondary"
                onClick={() => router.replace(pathname)}
              >
                إعادة ضبط الفلاتر
              </button>
            ) : (
              <Link
                className="ui-button ui-button--primary"
                href="/dashboard/sections/new"
              >
                {dashboardCopy.modules.sections.pages.create}
              </Link>
            )
          }
        />
      ) : (
        <>
          <div
            className={`${styles.tableCard} ui-responsive-table-wrap`}
            tabIndex={0}
            role="region"
            aria-label="جدول الأقسام"
          >
            <table
              className={`${styles.sectionsTable ?? ""} ui-responsive-table`}
            >
              <thead>
                <tr>
                  <th>اسم القسم</th>
                  <th>Slug</th>
                  <th>الموديول</th>
                  <th>الحالة</th>
                  <th>تاريخ الإنشاء</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {page.data.map((section) => (
                  <tr key={section.id}>
                    <td data-label="اسم القسم">
                      <strong>{section.name}</strong>
                      {section.description && (
                        <small>{section.description}</small>
                      )}
                    </td>
                    <td data-label="Slug" dir="ltr">
                      {section.slug}
                    </td>
                    <td data-label="الموديول">
                      {getSectionModuleLabel(section.module)}
                    </td>
                    <td data-label="الحالة">
                      <span
                        className={`${styles.status} ${
                          section.is_active ? styles.active : styles.inactive
                        }`}
                      >
                        {section.is_active ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td data-label="تاريخ الإنشاء">
                      {formatSectionDate(section.created_at)}
                    </td>
                    <td data-label="الإجراءات">
                      <div className={styles.actions}>
                        <Link
                          className="ui-button ui-button--secondary ui-focus"
                          href={`/dashboard/sections/${section.id}`}
                        >
                          عرض
                        </Link>
                        <Link
                          className="ui-button ui-button--secondary ui-focus"
                          href={`/dashboard/sections/${section.id}/edit`}
                        >
                          تعديل
                        </Link>
                        <button
                          className="ui-button ui-button--danger ui-focus"
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(section);
                          }}
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
          <nav className={styles.pagination} aria-label="صفحات الأقسام">
            <span>
              عرض {formatArabicNumber(page.from ?? 0)}–
              {formatArabicNumber(page.to ?? 0)} من{" "}
              {formatArabicNumber(page.total)}
            </span>
            <div>
              <button
                className="ui-button ui-button--secondary"
                disabled={page.current_page <= 1}
                onClick={() =>
                  setUrlQuery({ page: String(page.current_page - 1) })
                }
              >
                السابق
              </button>
              <span>
                صفحة {formatArabicNumber(page.current_page)} من{" "}
                {formatArabicNumber(page.last_page)}
              </span>
              <button
                className="ui-button ui-button--secondary"
                disabled={page.current_page >= page.last_page}
                onClick={() =>
                  setUrlQuery({ page: String(page.current_page + 1) })
                }
              >
                التالي
              </button>
            </div>
          </nav>
        </>
      )}

      <DeleteSectionDialog
        section={deleteTarget}
        open={deleteTarget !== null}
        busy={deleting}
        error={deleteError}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </PageContainer>
  );
}
