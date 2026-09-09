import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  getAdminScientificFatwa,
  getScientificFatwaCategories,
} from "@/features/scientific-fatwas/application/scientific-fatwas.service";
import { ScientificFatwaForm } from "@/features/scientific-fatwas/presentation/scientific-fatwa-form";
import { ScientificFatwaWorkspaceNav } from "@/features/scientific-fatwas/presentation/scientific-fatwa-workspace-nav";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تعديل المسألة العلمية" };

export default async function EditScientificFatwaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardPermission("fatwas.manage");
  const { id } = await params;
  const [result, categories] = await Promise.all([
    getAdminScientificFatwa(id),
    getScientificFatwaCategories(),
  ]);
  if (!result.success && result.error.status === 404) notFound();
  if (
    result.success &&
    result.data.managed_by_inbox &&
    result.data.source_fatwa_id
  )
    redirect(
      `/dashboard/scientific-fatwas/inbox/${result.data.source_fatwa_id}`,
    );
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.scientificFatwas.navigation}
          title="تعديل المسألة"
          description="حدّث السؤال أو الجواب أو الفهرسة مع التحكم في النشر والظهور في الرئيسية."
          actions={<ScientificFatwaWorkspaceNav current="catalog" />}
        />
      }
    >
      {!result.success || !categories.success ? (
        <ErrorState
          title="تعذّر تجهيز التعديل"
          description="تعذر تحميل بيانات المسألة أو قائمة التصنيف العلمي."
        />
      ) : (
        <ScientificFatwaForm
          initial={result.data}
          categories={categories.data.data}
        />
      )}
    </PageContainer>
  );
}
