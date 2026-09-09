import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getAdminDissertationForPresentation } from "@/features/dissertations/application/dissertations.service";
import { DissertationDetailView } from "@/features/dissertations/presentation/dissertation-detail-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تفاصيل الرسالة العلمية" };

export default async function DissertationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireDashboardPermission("dissertations.manage");
  const { id } = await params;
  const result = await getAdminDissertationForPresentation(id);
  if (!result.success && result.error.status === 404) notFound();
  const notice = (await searchParams).notice;

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.dissertations.navigation}
          title="تفاصيل الرسالة"
          description="مراجعة السجل الأكاديمي والمصدر وحالة النشر قبل ظهوره في الموقع."
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title={
            result.error.status === 403
              ? "لا تملك صلاحية عرض الرسالة"
              : "تعذّر تحميل الرسالة العلمية"
          }
          description="حاول مرة أخرى لاحقًا."
        />
      ) : (
        <DissertationDetailView
          dissertation={result.data.dissertation}
          {...(result.data.sourceUrl
            ? { sourceUrl: result.data.sourceUrl }
            : {})}
          {...(notice === "created" || notice === "updated" ? { notice } : {})}
        />
      )}
    </PageContainer>
  );
}
