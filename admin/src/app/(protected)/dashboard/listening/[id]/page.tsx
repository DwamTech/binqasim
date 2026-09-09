import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getAdminListeningSeriesForPresentation } from "@/features/listening/application/listening.service";
import { ListeningSeriesDetailView } from "@/features/listening/presentation/listening-series-detail-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تفاصيل سلسلة السماع" };

export default async function ListeningSeriesDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireDashboardPermission("listening.manage");
  const { id } = await params;
  const result = await getAdminListeningSeriesForPresentation(id);
  if (!result.success && result.error.status === 404) notFound();
  const notice = (await searchParams).notice;

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={`${dashboardCopy.modules.listening.navigation} · السلاسل`}
          title="تفاصيل السلسلة"
          description="راجع بيانات السلسلة وكتابها وعدد مجالسها قبل ظهورها في الموقع."
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذّر تحميل سلسلة السماع"
          description="حاول مرة أخرى لاحقًا."
        />
      ) : (
        <ListeningSeriesDetailView
          series={result.data.series}
          {...(result.data.sourceUrl
            ? { sourceUrl: result.data.sourceUrl }
            : {})}
          {...(notice === "created" || notice === "updated" ? { notice } : {})}
        />
      )}
    </PageContainer>
  );
}
