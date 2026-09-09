import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  getDashboardContentViews,
  getEnabledContentViewModuleKeys,
  getModuleReport,
  getReportsOverview,
} from "@/features/reports/application/reports.service";
import { filterContentViewsSummary } from "@/features/reports/domain/content-views.contracts";
import {
  findMetric,
  ReportsPageView,
} from "@/features/reports/presentation/reports-page-view";
import { normalizeReportQuery } from "@/features/reports/presentation/reports.query";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";

export const metadata: Metadata = {
  title: dashboardCopy.modules.reports.navigation,
};

export default async function ReportsOverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireDashboardPermission("reports.view");
  const query = normalizeReportQuery(await searchParams);
  const enabledContentViewModules = getEnabledContentViewModuleKeys();
  const [overview, feedback, views] = await Promise.all([
    getReportsOverview(query),
    getModuleReport("feedback", query),
    getDashboardContentViews(),
  ]);

  return (
    <PageContainer>
      <ReportsPageView
        report={overview.success ? overview.data : null}
        satisfaction={
          feedback.success
            ? findMetric(feedback.data, "feedback.average_rating")
            : null
        }
        satisfactionDistribution={
          feedback.success
            ? findMetric(feedback.data, "feedback.rating_distribution")
            : null
        }
        contentViews={
          views.success && views.data
            ? filterContentViewsSummary(views.data, enabledContentViewModules)
            : null
        }
        enabledContentViewModules={enabledContentViewModules}
        query={query}
        unavailable={!overview.success}
      />
    </PageContainer>
  );
}
