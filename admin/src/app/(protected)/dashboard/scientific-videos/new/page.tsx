import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getScientificVideoOptions } from "@/features/scientific-videos/application/scientific-videos.service";
import { resolveScientificVideoOptions } from "@/features/scientific-videos/domain/scientific-videos";
import { ScientificVideoForm } from "@/features/scientific-videos/presentation/scientific-video-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "إضافة مادة مرئية" };

export default async function NewScientificVideoPage() {
  await requireDashboardPermission("visuals.manage");
  const optionsResult = await getScientificVideoOptions();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.scientificVideos.navigation}
          title="إضافة مادة مرئية"
          description="أدخل بيانات البطاقة والفيديو ثم احفظ المادة مسودة أو انشرها الآن أو في موعد محدد."
        />
      }
    >
      <ScientificVideoForm
        options={resolveScientificVideoOptions(
          optionsResult.success ? optionsResult.data : undefined,
        )}
        {...(!optionsResult.success
          ? {
              optionsWarning:
                "تعذّر تحميل قوائم التصنيف من الخدمة؛ يمكنك المتابعة بالقيم الافتراضية.",
            }
          : {})}
      />
    </PageContainer>
  );
}
