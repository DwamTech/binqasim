import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getAdminListeningSeriesCatalog } from "@/features/listening/application/listening.service";
import { ListeningSessionForm } from "@/features/listening/presentation/listening-session-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "إضافة مجلس سماع" };

export default async function NewListeningSessionPage() {
  await requireDashboardPermission("listening.manage");
  const result = await getAdminListeningSeriesCatalog();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.listening.navigation}
          title="إضافة مجلس جديد"
          description="اربط المجلس بسلسلته، وأضف التسجيل، ثم احفظه مسودة أو انشره بعد المراجعة."
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذّر تجهيز النموذج"
          description="تعذر تحميل قائمة السلاسل."
        />
      ) : (
        <ListeningSessionForm series={result.data} />
      )}
    </PageContainer>
  );
}
