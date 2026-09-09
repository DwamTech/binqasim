import type { Metadata } from "next";
import Link from "next/link";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  getScientificVideoItems,
  getScientificVideoOptions,
} from "@/features/scientific-videos/application/scientific-videos.service";
import { resolveScientificVideoOptions } from "@/features/scientific-videos/domain/scientific-videos";
import { normalizeScientificVideoQuery } from "@/features/scientific-videos/infrastructure/scientific-videos.query";
import { ScientificVideosList } from "@/features/scientific-videos/presentation/scientific-videos-list";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = {
  title: dashboardCopy.modules.scientificVideos.navigation,
};

export default async function ScientificVideosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireDashboardPermission("visuals.manage");
  const rawSearchParams = await searchParams;
  const query = normalizeScientificVideoQuery(rawSearchParams);
  const [itemsResult, optionsResult] = await Promise.all([
    getScientificVideoItems(query),
    getScientificVideoOptions(),
  ]);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="المكتبة المرئية"
          title={dashboardCopy.modules.scientificVideos.navigation}
          description="إدارة المادة المميزة وبطاقات الفهرس والفيديو وصفحة التفاصيل من سجل واحد متوافق مع واجهة الموقع."
          actions={
            <Link
              href="/dashboard/scientific-videos/new"
              className="ui-button ui-button--primary ui-focus"
            >
              إضافة مادة مرئية
            </Link>
          }
        />
      }
    >
      {!itemsResult.success ? (
        <ErrorState
          title={
            itemsResult.error.status === 403
              ? "لا تملك صلاحية إدارة هذا القسم"
              : "تعذّر تحميل المواد المرئية"
          }
          description="تحقق من الاتصال بالخدمة ثم حاول مرة أخرى."
        />
      ) : (
        <ScientificVideosList
          page={itemsResult.data}
          query={query}
          options={resolveScientificVideoOptions(
            optionsResult.success ? optionsResult.data : undefined,
          )}
          deletedNotice={rawSearchParams.notice === "deleted"}
        />
      )}
    </PageContainer>
  );
}
