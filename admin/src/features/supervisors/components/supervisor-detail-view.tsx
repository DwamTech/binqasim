"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ErrorState } from "@/shared/components/ui/feedback";
import { Skeleton } from "@/shared/components/ui/primitives";
import { Badge, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { PageContainer } from "@/shared/components/layout/page-container";
import { formatArabicNumber } from "@/shared/lib/arabic-format";

import {
  formatSupervisorDate,
  roleLabels,
  type Supervisor,
} from "../supervisors.contracts";
import { getSupervisor } from "../supervisors.client";
import { PermissionSummary } from "./permission-checklist";
import { SupervisorActions } from "./supervisor-actions";
import styles from "./supervisors.module.css";

export function SupervisorDetailView({
  supervisorId,
}: {
  supervisorId: string;
}) {
  const searchParams = useSearchParams();
  const [supervisor, setSupervisor] = useState<Supervisor>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    searchParams.get("saved") === "1" ? "تم حفظ بيانات المشرف." : "",
  );
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getSupervisor(supervisorId, controller.signal);
        if (active) setSupervisor(result);
      } catch (reason) {
        if (active)
          setError(
            reason instanceof Error ? reason.message : "تعذر تحميل المشرف.",
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
  }, [reloadKey, supervisorId]);

  if (loading)
    return (
      <PageContainer>
        <Skeleton className={styles.detailSkeleton ?? ""} aria-label="تحميل" />
      </PageContainer>
    );
  if (error || !supervisor)
    return (
      <PageContainer>
        <ErrorState
          title="تعذر عرض حساب المشرف"
          description={error}
          onRetry={() => setReloadKey((value) => value + 1)}
        />
      </PageContainer>
    );

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.supervisors.navigation}
          title={supervisor.name}
          description={<span dir="ltr">{supervisor.email}</span>}
          actions={
            <div className={styles.detailHeaderActions}>
              <Link
                className="ui-button ui-button--secondary ui-focus"
                href={`/dashboard/supervisors/${supervisor.id}/edit`}
              >
                تعديل البيانات
              </Link>
              <SupervisorActions
                supervisor={supervisor}
                allowPassword
                onComplete={(message) => {
                  setNotice(message);
                  setReloadKey((value) => value + 1);
                }}
              />
            </div>
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
        <section className={styles.supervisorOverview}>
          <header className={styles.profileHeader}>
            <div className={styles.profileIdentity}>
              <span className={styles.profileAvatar} aria-hidden="true">
                {supervisor.name.trim().charAt(0) || "م"}
              </span>
              <div>
                <small>حساب مشرف</small>
                <h2>{supervisor.name}</h2>
                <a href={`mailto:${supervisor.email}`} dir="ltr">
                  {supervisor.email}
                </a>
              </div>
            </div>
            <Badge variant={supervisor.is_active ? "success" : "warning"}>
              {supervisor.is_active ? "حساب نشط" : "حساب معطل"}
            </Badge>
          </header>

          <div className={styles.profileStats}>
            <article>
              <span className={styles.profileStatIcon} aria-hidden="true">
                ◇
              </span>
              <div>
                <small>الدور</small>
                <strong>{roleLabels[supervisor.role]}</strong>
                <p>مستوى المسؤولية داخل لوحة التحكم.</p>
              </div>
            </article>
            <article>
              <span className={styles.profileStatIcon} aria-hidden="true">
                ✓
              </span>
              <div>
                <small>الصلاحيات المسموحة</small>
                <strong>
                  {formatArabicNumber(
                    supervisor.dashboard_permissions.length,
                  )}{" "}
                  صلاحية
                </strong>
                <p>عدد الصفحات المتاحة لهذا الحساب.</p>
              </div>
            </article>
            <article>
              <span className={styles.profileStatIcon} aria-hidden="true">
                {supervisor.is_active ? "●" : "○"}
              </span>
              <div>
                <small>حالة الوصول</small>
                <strong>
                  {supervisor.is_active ? "الدخول متاح" : "الدخول متوقف"}
                </strong>
                <p>
                  {supervisor.is_active
                    ? "يمكن للمشرف استخدام حسابه حاليًا."
                    : "لا يمكن للمشرف الدخول إلى اللوحة."}
                </p>
              </div>
            </article>
          </div>

          <div className={styles.accountDates}>
            <div>
              <span aria-hidden="true">＋</span>
              <div>
                <small>تاريخ الإنشاء</small>
                <strong>{formatSupervisorDate(supervisor.created_at)}</strong>
              </div>
            </div>
            <div>
              <span aria-hidden="true">↻</span>
              <div>
                <small>آخر تحديث</small>
                <strong>{formatSupervisorDate(supervisor.updated_at)}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.scopeCard}>
          <header>
            <div className={styles.scopeHeading}>
              <span className={styles.scopeIcon} aria-hidden="true">
                ⛨
              </span>
              <div>
                <span className={styles.eyebrow}>نطاق الوصول</span>
                <h2>الصفحات والصلاحيات المسموحة</h2>
                <p>ملخص صلاحيات الحساب موزع حسب نوع المحتوى.</p>
              </div>
            </div>
            {supervisor.role === "admin" && (
              <span className={styles.fullAccessBadge}>وصول كامل</span>
            )}
          </header>
          <PermissionSummary permissions={supervisor.dashboard_permissions} />
        </section>
      </main>
    </PageContainer>
  );
}
