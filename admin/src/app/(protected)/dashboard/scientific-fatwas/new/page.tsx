import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getScientificFatwaCategories } from "@/features/scientific-fatwas/application/scientific-fatwas.service";
import { ScientificFatwaForm } from "@/features/scientific-fatwas/presentation/scientific-fatwa-form";
import { ScientificFatwaWorkspaceNav } from "@/features/scientific-fatwas/presentation/scientific-fatwa-workspace-nav";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "إضافة مسألة علمية" };

export default async function NewScientificFatwaPage() {
  await requireDashboardPermission("fatwas.manage");
  const categories = await getScientificFatwaCategories();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.scientificFatwas.navigation}
          title="إضافة مسألة علمية"
          description="أدخل الحقول التي تظهر في الكرت وصفحة الجواب، ثم احفظها مسودة أو انشرها فورًا أو في موعد محدد."
          actions={<ScientificFatwaWorkspaceNav current="catalog" />}
        />
      }
    >
      {!categories.success ? (
        <ErrorState
          title="تعذر تحميل التصنيفات العلمية"
          description="يلزم تحميل قائمة التصنيف الموحدة قبل إضافة المسألة."
        />
      ) : (
        <ScientificFatwaForm categories={categories.data.data} />
      )}
    </PageContainer>
  );
}
