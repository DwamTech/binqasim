import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  getAdminListeningSeriesCatalog,
  getAdminListeningSessionDetail,
} from "@/features/listening/application/listening.service";
import { ListeningSessionForm } from "@/features/listening/presentation/listening-session-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تعديل مجلس السماع" };

export default async function EditListeningSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardPermission("listening.manage");
  const { id } = await params;
  const [sessionResult, seriesResult] = await Promise.all([
    getAdminListeningSessionDetail(id),
    getAdminListeningSeriesCatalog(),
  ]);
  if (!sessionResult.success && sessionResult.error.status === 404) notFound();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={`${dashboardCopy.modules.listening.navigation} · المجالس والتسجيلات الصوتية`}
          title="تعديل المجلس"
          description="حدّث بيانات المجلس أو التسجيل مع الحفاظ على الملف الحالي عند عدم استبداله."
        />
      }
    >
      {!sessionResult.success || !seriesResult.success ? (
        <ErrorState
          title="تعذّر تجهيز التعديل"
          description="تعذر تحميل بيانات المجلس أو قائمة السلاسل."
        />
      ) : (
        <ListeningSessionForm
          initial={sessionResult.data}
          series={seriesResult.data}
        />
      )}
    </PageContainer>
  );
}
