import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getAdminListeningSessionForPresentation } from "@/features/listening/application/listening.service";
import { ListeningSessionDetailView } from "@/features/listening/presentation/listening-session-detail-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تفاصيل مجلس السماع" };

export default async function ListeningSessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireDashboardPermission("listening.manage");
  const { id } = await params;
  const result = await getAdminListeningSessionForPresentation(id);
  if (!result.success && result.error.status === 404) notFound();
  const notice = (await searchParams).notice;

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={`${dashboardCopy.modules.listening.navigation} · المجالس والتسجيلات الصوتية`}
          title="تفاصيل المجلس"
          description="راجع السلسلة والترتيب والتسجيل وحالة النشر."
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذّر تحميل مجلس السماع"
          description="حاول مرة أخرى لاحقًا."
        />
      ) : (
        <ListeningSessionDetailView
          session={result.data.session}
          {...(result.data.sourceUrl
            ? { sourceUrl: result.data.sourceUrl }
            : {})}
          {...(notice === "created" || notice === "updated" ? { notice } : {})}
        />
      )}
    </PageContainer>
  );
}
