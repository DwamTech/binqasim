import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getScientificLibraryOptions } from "@/features/scientific-library/application/scientific-library.service";
import { resolveScientificLibraryOptions } from "@/features/scientific-library/domain/scientific-library.contracts";
import { ScientificLibraryForm } from "@/features/scientific-library/presentation/scientific-library-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "إضافة مصنَّف علمي" };

export default async function NewScientificLibraryItemPage() {
  await requireDashboardPermission("books.manage");
  const optionsResult = await getScientificLibraryOptions();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.library.navigation}
          title="إضافة مصنَّف"
          description="أدخل البيانات العلمية وارفع الملف والغلاف وحدد توقيت ظهوره للقراء."
        />
      }
    >
      <ScientificLibraryForm
        options={
          optionsResult.success
            ? optionsResult.data
            : resolveScientificLibraryOptions()
        }
        {...(!optionsResult.success
          ? {
              optionsWarning:
                "تعذر تحديث القوائم من الخادم؛ يمكنك المتابعة بالقيم الافتراضية الآمنة.",
            }
          : {})}
      />
    </PageContainer>
  );
}
