import Link from "next/link";
import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getAdminScientificFatwas } from "@/features/scientific-fatwas/application/scientific-fatwas.service";
import { normalizeScientificFatwaQuery } from "@/features/scientific-fatwas/infrastructure/scientific-fatwas.query";
import { ScientificFatwaListView } from "@/features/scientific-fatwas/presentation/scientific-fatwa-list-view";
import { ScientificFatwaWorkspaceNav } from "@/features/scientific-fatwas/presentation/scientific-fatwa-workspace-nav";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = {
  title: dashboardCopy.modules.scientificFatwas.navigation,
};

export default async function ScientificFatwasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireDashboardPermission("fatwas.manage");
  const rawSearchParams = await searchParams;
  const query = normalizeScientificFatwaQuery(rawSearchParams);
  const result = await getAdminScientificFatwas(query);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="أجوبة علمية موثقة"
          title={dashboardCopy.modules.scientificFatwas.navigation}
          description="إدارة السؤال والجواب والتصنيف العلمي والمراجع وحالة النشر من سجل واحد متوافق مع واجهة الموقع."
          actions={
            <>
              <ScientificFatwaWorkspaceNav current="catalog" />
              <Link
                href="/dashboard/scientific-fatwas/new"
                className="ui-button ui-button--primary ui-focus"
              >
                إضافة مسألة علمية
              </Link>
            </>
          }
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title={
            result.error.status === 403
              ? "لا تملك صلاحية إدارة الفتاوى"
              : "تعذّر تحميل المسائل العلمية"
          }
          description="تحقق من الاتصال بالخدمة ثم حاول مرة أخرى."
        />
      ) : (
        <ScientificFatwaListView
          paginator={result.data}
          query={query}
          deletedNotice={rawSearchParams.notice === "deleted"}
        />
      )}
    </PageContainer>
  );
}
