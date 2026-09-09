"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageContainer } from "@/shared/components/layout/page-container";
import {
  Button,
  Dialog,
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
  deleteTourGuide,
  getTourGuidesSummary,
  listTourGuides,
} from "../application/tour-guides.client";
import type {
  PaginatedResource,
  TourGuide,
  TourGuidesSummary,
} from "../domain/tour-guides.contracts";
import styles from "./tour-guides.module.css";

export function TourGuidesListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(
    () => ({
      search: searchParams.get("search") || undefined,
      is_active:
        searchParams.get("is_active") === "true" ||
        searchParams.get("is_active") === "false"
          ? (searchParams.get("is_active") as "true" | "false")
          : undefined,
      page: Math.max(1, Number(searchParams.get("page")) || 1),
      per_page: 15,
    }),
    [searchParams],
  );
  const [search, setSearch] = useState(query.search ?? "");
  const [page, setPage] = useState<PaginatedResource<TourGuide>>();
  const [summary, setSummary] = useState<TourGuidesSummary>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteIntent, setDeleteIntent] = useState<TourGuide>();
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const setQuery = useCallback(
    (changes: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(changes).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
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
    async function load() {
      setLoading(true);
      try {
        const [result, totals] = await Promise.all([
          listTourGuides(query, controller.signal),
          getTourGuidesSummary(controller.signal),
        ]);
        if (!active) return;
        setPage(result);
        setSummary(totals);
        setError("");
      } catch (reason) {
        if (!active) return;
        setError(
          reason instanceof Error ? reason.message : "تعذر تحميل المرشدين.",
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
    if (!deleteIntent || deleting) return;
    setDeleting(true);
    try {
      await deleteTourGuide(deleteIntent.id);
      setDeleteIntent(undefined);
      setNotice("تمت أرشفة المرشد وإخفاؤه من دليل الزوار.");
      setReloadKey((value) => value + 1);
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "تعذرت أرشفة المرشد.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const filtered = Boolean(query.search || query.is_active);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة الرحلات السياحية"
          title="إدارة المرشدين السياحيين"
          description="تحكم في بيانات المرشدين وترتيب ظهورهم للزوار ومسارات الجولات المتاحة لكل مرشد."
          actions={
            <Link
              href="/dashboard/tour-guides/guides/new"
              className="ui-button ui-button--primary ui-focus"
            >
              إضافة مرشد سياحي
            </Link>
          }
        />
      }
    >
      <main className={styles.page}>
        <section className={styles.compactMetrics} aria-label="ملخص المرشدين">
          <article>
            <span>إجمالي المرشدين</span>
            <strong>
              {summary ? formatArabicNumber(summary.guides_total) : "—"}
            </strong>
          </article>
          <article>
            <span>نشطون للزوار</span>
            <strong>
              {summary ? formatArabicNumber(summary.guides_active) : "—"}
            </strong>
          </article>
          <article>
            <span>غير نشطين</span>
            <strong>
              {summary ? formatArabicNumber(summary.guides_inactive) : "—"}
            </strong>
          </article>
        </section>

        <FilterPanel
          title="البحث والتصفية"
          description="ابحث باسم المرشد أو رقم الترخيص، وخصص النتائج بحسب حالة الظهور."
        >
          <div className={styles.filters}>
            <label className={styles.searchField}>
              <span>البحث</span>
              <div>
                <Input
                  value={search}
                  maxLength={255}
                  placeholder="الاسم، المسمى أو رقم الترخيص..."
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
              <span>حالة الظهور</span>
              <Select
                value={query.is_active ?? ""}
                aria-label="حالة ظهور المرشد"
                options={[
                  { value: "", label: "كل الحالات" },
                  { value: "true", label: "نشط" },
                  { value: "false", label: "غير نشط" },
                ]}
                onValueChange={(value) =>
                  setQuery({ is_active: value || undefined, page: undefined })
                }
              />
            </label>
            {filtered && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setQuery({
                    search: undefined,
                    is_active: undefined,
                    page: undefined,
                  });
                }}
              >
                مسح الفلاتر
              </Button>
            )}
          </div>
        </FilterPanel>

        {notice && (
          <p className={styles.successNotice} role="status">
            {notice}
          </p>
        )}

        {loading ? (
          <div className={styles.skeletons} aria-label="تحميل المرشدين">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} style={{ minBlockSize: "6rem" }} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="تعذر تحميل المرشدين"
            description={error}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : !page?.data.length ? (
          <EmptyState
            title={filtered ? "لا توجد نتائج مطابقة" : "لا يوجد مرشدون بعد"}
            description={
              filtered
                ? "غيّر عبارة البحث أو الفلاتر ثم حاول مرة أخرى."
                : "ابدأ بإضافة أول مرشد ليظهر في بوابة الزائر."
            }
            action={
              !filtered ? (
                <Link
                  href="/dashboard/tour-guides/guides/new"
                  className="ui-button ui-button--primary ui-focus"
                >
                  إضافة أول مرشد
                </Link>
              ) : undefined
            }
          />
        ) : (
          <section className={styles.tableShell}>
            <header className={styles.tableHeading}>
              <div>
                <small>دليل المرشدين</small>
                <h2>المرشدون المسجلون</h2>
              </div>
              <strong>{formatArabicNumber(page.meta.total)} مرشد</strong>
            </header>
            <div
              className="ui-responsive-table-wrap"
              tabIndex={0}
              role="region"
              aria-label="جدول المرشدين السياحيين"
            >
              <table
                className={`${styles.table} ${styles.guidesTable ?? ""} ui-responsive-table`}
              >
                <thead>
                  <tr>
                    <th>المرشد</th>
                    <th>الخبرة واللغات</th>
                    <th>المسارات</th>
                    <th>الترتيب</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {page.data.map((guide) => (
                    <tr
                      key={guide.id}
                      className={
                        guide.is_active ? undefined : styles.inactiveGuideRow
                      }
                    >
                      <td data-label="المرشد">
                        <div className={styles.guideIdentity}>
                          <GuidePhoto guide={guide} />
                          <div>
                            <strong>{guide.name}</strong>
                            <small>{guide.title}</small>
                            {guide.license_number && (
                              <code dir="ltr">{guide.license_number}</code>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        className={styles.guideDetailsCell}
                        data-label="الخبرة واللغات"
                      >
                        <strong>
                          {formatArabicNumber(guide.experience_years)} سنوات
                        </strong>
                        <small>{guide.languages.join("، ") || "—"}</small>
                      </td>
                      <td className={styles.numericCell} data-label="المسارات">
                        <span>
                          {formatArabicNumber(guide.tour_routes.length)} مسارات
                        </span>
                      </td>
                      <td className={styles.numericCell} data-label="الترتيب">
                        <span>{formatArabicNumber(guide.display_order)}</span>
                      </td>
                      <td className={styles.statusCell} data-label="الحالة">
                        <span
                          className={`${styles.visibilityBadge} ${
                            guide.is_active ? styles.active : styles.inactive
                          }`}
                        >
                          {guide.is_active ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td className={styles.actionsCell} data-label="الإجراءات">
                        <div className={styles.rowActions}>
                          <Link
                            className="ui-button ui-button--secondary ui-focus"
                            href={`/dashboard/tour-guides/guides/${guide.id}`}
                          >
                            عرض
                          </Link>
                          <Link
                            className="ui-button ui-button--secondary ui-focus"
                            href={`/dashboard/tour-guides/guides/${guide.id}/edit`}
                          >
                            تعديل
                          </Link>
                          <Button
                            variant="danger"
                            onClick={() => setDeleteIntent(guide)}
                          >
                            أرشفة
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {page.meta.last_page > 1 && (
              <nav className={styles.pagination} aria-label="صفحات المرشدين">
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

        <Dialog
          open={Boolean(deleteIntent)}
          onOpenChange={(open) =>
            !open && !deleting && setDeleteIntent(undefined)
          }
          title="أرشفة المرشد السياحي"
          dismissible={!deleting}
          footer={
            <div className={styles.dialogActions}>
              <Button
                variant="secondary"
                disabled={deleting}
                onClick={() => setDeleteIntent(undefined)}
              >
                تراجع
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={() => void confirmDelete()}
              >
                تأكيد الأرشفة
              </Button>
            </div>
          }
        >
          <div className={styles.dangerDialog}>
            <span aria-hidden="true">!</span>
            <div>
              <p>
                سيُؤرشف المرشد ويختفي من دليل الزوار، وتبقى طلباته السابقة
                محفوظة.
              </p>
              <strong>{deleteIntent?.name}</strong>
            </div>
          </div>
        </Dialog>
      </main>
    </PageContainer>
  );
}

function GuidePhoto({ guide }: { guide: TourGuide }) {
  if (guide.photo_url)
    return <img src={guide.photo_url} alt={`صورة ${guide.name}`} />;
  return <span aria-hidden="true">{guide.name.trim().charAt(0) || "م"}</span>;
}
