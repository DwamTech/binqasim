import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { DissertationForm } from "@/features/dissertations/presentation/dissertation-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "إضافة رسالة علمية" };

export default async function NewDissertationPage() {
  await requireDashboardPermission("dissertations.manage");
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.dissertations.navigation}
          title="إضافة رسالة علمية"
          description="أدخل جميع بيانات الكرت وصفحة التفاصيل، ثم أضف الملف أو الرابط وحدد حالة النشر."
        />
      }
    >
      <DissertationForm />
    </PageContainer>
  );
}
