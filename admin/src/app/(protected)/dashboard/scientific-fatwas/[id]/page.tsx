import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getAdminScientificFatwa } from "@/features/scientific-fatwas/application/scientific-fatwas.service";
import { ScientificFatwaDetailView } from "@/features/scientific-fatwas/presentation/scientific-fatwa-detail-view";
import { ScientificFatwaWorkspaceNav } from "@/features/scientific-fatwas/presentation/scientific-fatwa-workspace-nav";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تفاصيل المسألة العلمية" };

export default async function ScientificFatwaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireDashboardPermission("fatwas.manage");
  const { id } = await params;
  const result = await getAdminScientificFatwa(id);
  if (!result.success && result.error.status === 404) notFound();
  const notice = (await searchParams).notice;
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.scientificFatwas.navigation}
          title="مراجعة المسألة"
          description="راجع النص والمراجع والفهرسة وحالة الظهور قبل نشر الجواب للعامة."
          actions={<ScientificFatwaWorkspaceNav current="catalog" />}
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذّر تحميل المسألة"
          description="حاول مرة أخرى لاحقًا."
        />
      ) : (
        <ScientificFatwaDetailView
          item={result.data}
          {...(notice === "created" || notice === "updated" ? { notice } : {})}
        />
      )}
    </PageContainer>
  );
}
