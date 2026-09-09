import type { Metadata } from "next";

import { SupervisorForm } from "@/features/supervisors/components/supervisor-form";
import { requireDashboardAdmin } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";

export const metadata: Metadata = {
  title: dashboardCopy.modules.supervisors.pages.edit,
};

export default async function EditSupervisorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardAdmin();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.supervisors.navigation}
          title={dashboardCopy.modules.supervisors.pages.edit}
          description="حدّث بيانات الحساب والدور والصلاحيات الممنوحة للمشرف."
        />
      }
    >
      <SupervisorForm mode="edit" supervisorId={(await params).id} />
    </PageContainer>
  );
}
