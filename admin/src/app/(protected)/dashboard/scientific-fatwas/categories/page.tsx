import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getScientificFatwaCategories } from "@/features/scientific-fatwas/application/scientific-fatwas.service";
import { ScientificFatwaCategoryManager } from "@/features/scientific-fatwas/presentation/scientific-fatwa-category-manager";
import { ScientificFatwaWorkspaceNav } from "@/features/scientific-fatwas/presentation/scientific-fatwa-workspace-nav";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "إدارة قائمة التصنيفات" };

export default async function ScientificFatwaCategoriesPage() {
  await requireDashboardPermission("fatwas.manage");
  const result = await getScientificFatwaCategories();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.scientificFatwas.navigation}
          title="إدارة قائمة التصنيفات"
          description="مصدر موحد للتصنيف العلمي في نموذج سؤال الزائر، وإضافة المسألة، وصندوق الأسئلة."
          actions={<ScientificFatwaWorkspaceNav current="categories" />}
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذر تحميل التصنيفات العلمية"
          description="تحقق من اتصال الخدمة ثم حاول مرة أخرى."
        />
      ) : (
        <ScientificFatwaCategoryManager initial={result.data.data} />
      )}
    </PageContainer>
  );
}
