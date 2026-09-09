"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { dashboardPermissions } from "@/features/auth/domain/auth.contracts";
import { EmptyState, ErrorState } from "@/shared/components/ui/feedback";
import { Select } from "@/shared/components/ui/forms";
import { Button, Input, Skeleton } from "@/shared/components/ui/primitives";
import { FilterPanel, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { PageContainer } from "@/shared/components/layout/page-container";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import {
  formatSupervisorDate,
  normalizeSupervisorQuery,
  permissionLabels,
  roleLabels,
  supervisorRoles,
  type Supervisor,
  type SupervisorPage,
} from "../supervisors.contracts";
import { listSupervisors } from "../supervisors.client";
import { SupervisorActions } from "./supervisor-actions";
import styles from "./supervisors.module.css";

export function SupervisorsListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(
    () =>
      normalizeSupervisorQuery({
        search: searchParams.get("search") ?? undefined,
        role: searchParams.get("role") ?? undefined,
        is_active: searchParams.get("is_active") ?? undefined,
        permission: searchParams.get("permission") ?? undefined,
        page: searchParams.get("page") ?? undefined,
      }),
    [searchParams],
  );
  const [search, setSearch] = useState(query.search ?? "");
  const [page, setPage] = useState<SupervisorPage>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

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
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await listSupervisors(query, controller.signal);
        if (active) setPage(result);
      } catch (reason) {
        if (active)
          setError(
            reason instanceof Error ? reason.message : "تعذر تحميل المشرفين.",
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

  const changed = (message: string) => {
    setNotice(message);
    setReloadKey((value) => value + 1);
  };

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة الصلاحيات"
          title={dashboardCopy.modules.supervisors.pages.list}
          description="الدور يحدد طبيعة المشرف، والصلاحيات تحدد الصفحات المتاحة، وتظل قواعد كل موديول هي المرجع للعمليات والملكية."
          actions={
            <Link
              className="ui-button ui-button--primary ui-focus"
              href="/dashboard/supervisors/new"
            >
              {dashboardCopy.modules.supervisors.pages.create}
            </Link>
          }
        />
      }
    >
      <main className={styles.page}>
        {notice && (
          <p className={styles.successNotice} role="status">
            {notice}
          </p>
        )}

        <FilterPanel
          title="تصفية المشرفين"
          description="ابحث بالاسم أو البريد وحدد الدور والحالة والصلاحية."
        >
          <div className={styles.filters}>
            <label className={styles.searchField}>
              <span>البحث بالاسم أو البريد</span>
              <div>
                <Input
                  value={search}
                  placeholder="ابدأ الكتابة..."
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")}>
                    ×
                  </button>
                )}
              </div>
            </label>
            <FilterSelect
              label="الدور"
              value={query.role ?? ""}
              onChange={(value) => setQuery({ role: value, page: undefined })}
              options={supervisorRoles.map((role) => [role, roleLabels[role]])}
            />
            <FilterSelect
              label="الحالة"
              value={query.is_active ?? ""}
              onChange={(value) =>
                setQuery({ is_active: value, page: undefined })
              }
              options={[
                ["true", "نشط"],
                ["false", "معطل"],
              ]}
            />
            <FilterSelect
              label="الصلاحية"
              value={query.permission ?? ""}
              onChange={(value) =>
                setQuery({ permission: value, page: undefined })
              }
              options={dashboardPermissions.map((permission) => [
                permission,
                permissionLabels[permission],
              ])}
            />
          </div>
          {(search || query.role || query.is_active || query.permission) && (
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
        </FilterPanel>

        {loading ? (
          <div className={styles.loadingTable} aria-busy="true">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} style={{ minBlockSize: "4.5rem" }} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="تعذر تحميل المشرفين"
            description={error}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : !page || page.data.length === 0 ? (
          <EmptyState
            title={query.search ? "لا توجد نتائج مطابقة" : "لا يوجد مشرفون"}
            description="جرّب تغيير البحث أو الفلاتر، أو أضف مشرفًا جديدًا."
          />
        ) : (
          <>
            <div
              className={`${styles.tableCard} ui-responsive-table-wrap`}
              tabIndex={0}
              role="region"
              aria-label="جدول المشرفين"
            >
              <table className="ui-responsive-table">
                <thead>
                  <tr>
                    <th>المشرف</th>
                    <th>الدور</th>
                    <th>الحالة</th>
                    <th>الصلاحيات</th>
                    <th>آخر تحديث</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {page.data.map((supervisor) => (
                    <SupervisorRow
                      key={supervisor.id}
                      supervisor={supervisor}
                      onChanged={changed}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <nav className={styles.pagination} aria-label="صفحات المشرفين">
              <span>
                {formatArabicNumber(page.total)} مشرف — صفحة{" "}
                {formatArabicNumber(page.current_page)} من{" "}
                {formatArabicNumber(page.last_page)}
              </span>
              <div>
                <Button
                  variant="secondary"
                  disabled={page.current_page <= 1}
                  onClick={() =>
                    setQuery({ page: String(page.current_page - 1) })
                  }
                >
                  السابق
                </Button>
                <Button
                  variant="secondary"
                  disabled={page.current_page >= page.last_page}
                  onClick={() =>
                    setQuery({ page: String(page.current_page + 1) })
                  }
                >
                  التالي
                </Button>
              </div>
            </nav>
          </>
        )}
      </main>
    </PageContainer>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string | undefined) => void;
  options: Array<readonly [string, string]>;
}) {
  return (
    <label>
      <span>{label}</span>
      <Select
        value={value}
        aria-label={label}
        options={[
          { value: "", label: "الكل" },
          ...options.map(([optionValue, optionLabel]) => ({
            value: optionValue,
            label: optionLabel,
          })),
        ]}
        onValueChange={(nextValue) => onChange(nextValue || undefined)}
      />
    </label>
  );
}

function SupervisorRow({
  supervisor,
  onChanged,
}: {
  supervisor: Supervisor;
  onChanged: (message: string) => void;
}) {
  return (
    <tr>
      <td data-label="المشرف">
        <strong>{supervisor.name}</strong>
        <small dir="ltr">{supervisor.email}</small>
      </td>
      <td data-label="الدور">{roleLabels[supervisor.role]}</td>
      <td data-label="الحالة">
        <span
          className={`${styles.statusBadge} ${
            supervisor.is_active ? styles.active : styles.inactive
          }`}
        >
          {supervisor.is_active ? "● نشط" : "○ معطل"}
        </span>
      </td>
      <td data-label="الصلاحيات">
        {supervisor.role === "admin"
          ? "وصول كامل"
          : `${formatArabicNumber(supervisor.dashboard_permissions.length)} صلاحيات`}
      </td>
      <td data-label="آخر تحديث">
        {formatSupervisorDate(supervisor.updated_at)}
      </td>
      <td data-label="الإجراءات">
        <div className={styles.rowActions}>
          <Link href={`/dashboard/supervisors/${supervisor.id}`}>عرض</Link>
          <Link href={`/dashboard/supervisors/${supervisor.id}/edit`}>
            تعديل
          </Link>
          <SupervisorActions supervisor={supervisor} onComplete={onChanged} />
        </div>
      </td>
    </tr>
  );
}
