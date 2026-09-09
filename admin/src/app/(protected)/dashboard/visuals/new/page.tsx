import { createVisualAction } from "@/features/visuals/application/visuals.actions";
import { getVisualSections } from "@/features/visuals/application/visuals.service";
import { VisualForm } from "@/features/visuals/presentation/components/visual-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { Alert, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
export const metadata: Metadata = {
  title: dashboardCopy.modules.visuals.pages.create,
};
import { PageContainer } from "@/shared/components/layout/page-container";

export default async function NewVisualPage() {
  await requireDashboardPermission("visuals.manage");
  const sections = await getVisualSections();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.visuals.navigation}
          title={dashboardCopy.modules.visuals.pages.create}
          description="أضف فيديو مرفوعًا أو رابطًا خارجيًا وفق العقد المعتمد."
        />
      }
    >
      {!sections.success && (
        <Alert variant="error" title="تعذّر تحميل الأقسام">
          يمكن حفظ المرئية بدون قسم أو إعادة المحاولة لاحقًا.
        </Alert>
      )}
      <VisualForm
        action={createVisualAction}
        sections={sections.success ? sections.data : []}
      />
    </PageContainer>
  );
}
import type { Metadata } from "next";
