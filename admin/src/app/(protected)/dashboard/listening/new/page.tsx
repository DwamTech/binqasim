import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { ListeningSeriesForm } from "@/features/listening/presentation/listening-series-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "إضافة سلسلة سماع" };

export default async function NewListeningSeriesPage() {
  await requireDashboardPermission("listening.manage");
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.listening.navigation}
          title="إضافة سلسلة جديدة"
          description="أنشئ هوية السلسلة وأضف الكتاب المرتبط بها، ثم راجع حالة النشر."
        />
      }
    >
      <ListeningSeriesForm />
    </PageContainer>
  );
}
