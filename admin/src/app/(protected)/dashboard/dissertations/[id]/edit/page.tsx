import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getAdminDissertation } from "@/features/dissertations/application/dissertations.service";
import { DissertationForm } from "@/features/dissertations/presentation/dissertation-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تعديل الرسالة العلمية" };

export default async function EditDissertationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardPermission("dissertations.manage");
  const { id } = await params;
  const result = await getAdminDissertation(id);
  if (!result.success && result.error.status === 404) notFound();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.dissertations.navigation}
          title="تعديل الرسالة"
          description="حدّث البيانات أو المصدر مع الحفاظ على الملف الحالي عند عدم استبداله."
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذر تجهيز التعديل"
          description="تعذر تحميل بيانات الرسالة العلمية."
        />
      ) : (
        <DissertationForm initial={result.data} />
      )}
    </PageContainer>
  );
}
