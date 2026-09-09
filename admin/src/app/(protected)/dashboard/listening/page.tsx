import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  getAdminListeningSeries,
  getAdminListeningSeriesDetail,
} from "@/features/listening/application/listening.service";
import { ListeningWorkspace } from "@/features/listening/presentation/listening-workspace";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = {
  title: dashboardCopy.modules.listening.navigation,
};

async function getListeningWorkspaceSeries() {
  const firstPage = await getAdminListeningSeries({ page: 1, per_page: 100 });
  if (!firstPage.success || firstPage.data.last_page <= 1) return firstPage;

  const records = [...firstPage.data.data];
  for (let page = 2; page <= firstPage.data.last_page; page += 1) {
    const nextPage = await getAdminListeningSeries({ page, per_page: 100 });
    if (!nextPage.success) return nextPage;
    records.push(...nextPage.data.data);
  }

  return {
    ...firstPage,
    data: {
      ...firstPage.data,
      data: records,
      current_page: 1,
      last_page: 1,
      per_page: Math.max(records.length, firstPage.data.per_page),
    },
  };
}

export default async function ListeningSeriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireDashboardPermission("listening.manage");
  const rawSearchParams = await searchParams;
  const result = await getListeningWorkspaceSeries();
  const requestedSeriesId =
    typeof rawSearchParams.series_id === "string"
      ? rawSearchParams.series_id
      : undefined;
  const selectedSeriesId =
    requestedSeriesId ?? (result.success ? result.data.data[0]?.id : undefined);
  const selectedSeriesResult = selectedSeriesId
    ? await getAdminListeningSeriesDetail(selectedSeriesId)
    : undefined;
  const requestedSeriesFailed = Boolean(
    requestedSeriesId && selectedSeriesResult && !selectedSeriesResult.success,
  );
  const initialSearch =
    typeof rawSearchParams.search === "string"
      ? rawSearchParams.search
      : typeof rawSearchParams.category === "string"
        ? rawSearchParams.category
        : "";
  const initialStatus =
    rawSearchParams.is_published === "1"
      ? "published"
      : rawSearchParams.is_published === "0"
        ? "draft"
        : "all";

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة المحتوى الصوتي العلمي"
          title={dashboardCopy.modules.listening.navigation}
          description="أدر السلاسل ومجالس كل سلسلة وتسجيلاتها من سياق واحد دون التنقل بين صفحات منفصلة."
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title={
            result.error.status === 403
              ? `لا تملك صلاحية الوصول إلى ${dashboardCopy.modules.listening.navigation}`
              : "تعذّر تحميل السلاسل"
          }
          description="تحقق من الاتصال بالخدمة ثم حاول مرة أخرى."
        />
      ) : (
        <ListeningWorkspace
          initialSeriesPage={result.data}
          {...(selectedSeriesId
            ? { initialSelectedSeriesId: selectedSeriesId }
            : {})}
          {...(selectedSeriesResult?.success
            ? { initialSelectedSeries: selectedSeriesResult.data }
            : {})}
          initialSeriesSearch={initialSearch}
          initialSeriesStatus={initialStatus}
          {...(requestedSeriesFailed
            ? {
                initialNotice:
                  selectedSeriesResult &&
                  !selectedSeriesResult.success &&
                  selectedSeriesResult.error.status === 404
                    ? "السلسلة المطلوبة غير متاحة؛ يمكنك اختيار سلسلة أخرى من القائمة."
                    : "تعذّر تحميل تفاصيل السلسلة المطلوبة؛ ستتم إعادة المحاولة داخل مساحة العمل.",
              }
            : {})}
        />
      )}
    </PageContainer>
  );
}
