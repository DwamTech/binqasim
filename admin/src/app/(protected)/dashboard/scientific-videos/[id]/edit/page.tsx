import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  getScientificVideoItem,
  getScientificVideoOptions,
} from "@/features/scientific-videos/application/scientific-videos.service";
import { resolveScientificVideoOptions } from "@/features/scientific-videos/domain/scientific-videos";
import { ScientificVideoForm } from "@/features/scientific-videos/presentation/scientific-video-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تعديل المادة المرئية" };

export default async function EditScientificVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardPermission("visuals.manage");
  const { id } = await params;
  const [itemResult, optionsResult] = await Promise.all([
    getScientificVideoItem(id),
    getScientificVideoOptions(),
  ]);
  if (!itemResult.success && itemResult.error.status === 404) notFound();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.scientificVideos.navigation}
          title="تعديل المادة المرئية"
          description="حدّث بيانات البطاقة والفيديو وحالة الظهور مع الاحتفاظ بالملف الحالي عند عدم استبداله."
        />
      }
    >
      {!itemResult.success ? (
        <ErrorState
          title="تعذّر تجهيز التعديل"
          description="تعذر تحميل بيانات المادة المرئية."
        />
      ) : (
        <ScientificVideoForm
          initial={itemResult.data}
          options={resolveScientificVideoOptions(
            optionsResult.success ? optionsResult.data : undefined,
          )}
          {...(!optionsResult.success
            ? {
                optionsWarning:
                  "تعذّر تحميل قوائم التصنيف من الخدمة؛ يمكنك متابعة تعديل السجل الحالي.",
              }
            : {})}
        />
      )}
    </PageContainer>
  );
}
