import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getAdminListeningSeriesDetail } from "@/features/listening/application/listening.service";
import { ListeningSeriesForm } from "@/features/listening/presentation/listening-series-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تعديل سلسلة السماع" };

export default async function EditListeningSeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardPermission("listening.manage");
  const { id } = await params;
  const result = await getAdminListeningSeriesDetail(id);
  if (!result.success && result.error.status === 404) notFound();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={`${dashboardCopy.modules.listening.navigation} · السلاسل`}
          title="تعديل السلسلة"
          description="حدّث البيانات أو الكتاب مع الحفاظ على الملف الحالي عند عدم استبداله."
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذّر تجهيز التعديل"
          description="تعذر تحميل بيانات السلسلة."
        />
      ) : (
        <ListeningSeriesForm initial={result.data} />
      )}
    </PageContainer>
  );
}
