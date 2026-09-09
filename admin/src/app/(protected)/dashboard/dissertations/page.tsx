import Link from "next/link";
import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getAdminDissertations } from "@/features/dissertations/application/dissertations.service";
import { normalizeDissertationQuery } from "@/features/dissertations/infrastructure/dissertations.query";
import { DissertationsListView } from "@/features/dissertations/presentation/dissertations-list-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = {
  title: dashboardCopy.modules.dissertations.navigation,
};

export default async function DissertationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireDashboardPermission("dissertations.manage");
  const rawSearchParams = await searchParams;
  const query = normalizeDissertationQuery(rawSearchParams);
  const result = await getAdminDissertations(query);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="الإنتاج الأكاديمي"
          title={dashboardCopy.modules.dissertations.navigation}
          description="إدارة الرسائل وبيانات الباحثين والمشاركة الأكاديمية وملفات القراءة من مكان واحد."
          actions={
            <Link
              href="/dashboard/dissertations/new"
              className="ui-button ui-button--primary ui-focus"
            >
              إضافة رسالة علمية
            </Link>
          }
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title={
            result.error.status === 403
              ? "لا تملك صلاحية إدارة الرسائل"
              : "تعذّر تحميل الرسائل العلمية"
          }
          description="تحقق من الاتصال بالخدمة ثم حاول مرة أخرى."
        />
      ) : (
        <DissertationsListView
          paginator={result.data}
          query={query}
          deletedNotice={rawSearchParams.notice === "deleted"}
        />
      )}
    </PageContainer>
  );
}
