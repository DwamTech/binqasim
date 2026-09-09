import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  getScientificVideoItem,
  getScientificVideoOptions,
} from "@/features/scientific-videos/application/scientific-videos.service";
import { resolveScientificVideoOptions } from "@/features/scientific-videos/domain/scientific-videos";
import { ScientificVideoDetail } from "@/features/scientific-videos/presentation/scientific-video-detail";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تفاصيل المادة المرئية" };

export default async function ScientificVideoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireDashboardPermission("visuals.manage");
  const { id } = await params;
  const [itemResult, optionsResult] = await Promise.all([
    getScientificVideoItem(id),
    getScientificVideoOptions(),
  ]);
  if (!itemResult.success && itemResult.error.status === 404) notFound();
  const notice = (await searchParams).notice;

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.scientificVideos.navigation}
          title="مراجعة المادة المرئية"
          description="راجع بيانات العرض والمصدر وحالة النشر قبل إتاحتها في الموقع."
        />
      }
    >
      {!itemResult.success ? (
        <ErrorState
          title="تعذّر تحميل المادة المرئية"
          description="تحقق من الاتصال بالخدمة ثم حاول مرة أخرى."
        />
      ) : (
        <ScientificVideoDetail
          item={itemResult.data}
          options={resolveScientificVideoOptions(
            optionsResult.success ? optionsResult.data : undefined,
          )}
          {...(notice === "created" || notice === "updated" ? { notice } : {})}
        />
      )}
    </PageContainer>
  );
}
