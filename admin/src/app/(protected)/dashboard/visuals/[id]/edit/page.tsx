import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateVisualAction } from "@/features/visuals/application/visuals.actions";
import {
  getVisual,
  getVisualSections,
} from "@/features/visuals/application/visuals.service";
import { VisualForm } from "@/features/visuals/presentation/components/visual-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { Alert, ErrorState, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
export const metadata: Metadata = {
  title: dashboardCopy.modules.visuals.pages.edit,
};
import { PageContainer } from "@/shared/components/layout/page-container";

export default async function EditVisualPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardPermission("visuals.manage");
  const { id } = await params;
  const [visual, sections] = await Promise.all([
    getVisual(id),
    getVisualSections(),
  ]);
  if (!visual.success && visual.error.status === 404) notFound();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.visuals.navigation}
          title={dashboardCopy.modules.visuals.pages.edit}
          description="اترك الملف والصورة فارغين للحفاظ على الوسائط الحالية."
        />
      }
    >
      {!visual.success ? (
        <ErrorState
          title="تعذّر تحميل المرئية"
          description="حاول مرة أخرى لاحقًا."
        />
      ) : (
        <>
          <>
            {!sections.success && (
              <Alert variant="error">
                تعذّر تحميل الأقسام، يمكنك الحفاظ على القسم الحالي أو الحفظ
                بدونه.
              </Alert>
            )}
          </>
          <VisualForm
            action={updateVisualAction.bind(null, id)}
            sections={sections.success ? sections.data : []}
            initial={visual.data}
          />
        </>
      )}
    </PageContainer>
  );
}
