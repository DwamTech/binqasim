import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { deleteVisualAction } from "@/features/visuals/application/visuals.actions";
import { getVisual } from "@/features/visuals/application/visuals.service";
import { VisualDetailView } from "@/features/visuals/presentation/components/visual-detail-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { ErrorState, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
export const metadata: Metadata = {
  title: dashboardCopy.modules.visuals.pages.detail,
};
import { PageContainer } from "@/shared/components/layout/page-container";

export default async function VisualDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardPermission("visuals.manage");
  const { id } = await params;
  const visual = await getVisual(id);
  if (!visual.success && visual.error.status === 404) notFound();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.visuals.navigation}
          title={dashboardCopy.modules.visuals.pages.detail}
          description="عرض المحتوى والبيانات المرتبطة به."
        />
      }
    >
      {!visual.success ? (
        <ErrorState
          title={
            visual.error.status === 403
              ? "لا تملك صلاحية عرض هذه المرئية"
              : "تعذّر تحميل المرئية"
          }
          description="حاول مرة أخرى لاحقًا."
        />
      ) : (
        <VisualDetailView
          visual={visual.data}
          deleteAction={deleteVisualAction}
        />
      )}
    </PageContainer>
  );
}
