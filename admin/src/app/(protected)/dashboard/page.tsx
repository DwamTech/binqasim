import { DashboardLandingView } from "./_components/dashboard-landing-view";
import type { DashboardLandingInsights } from "./_components/dashboard-landing-view";
import { buildDashboardInsights } from "./_components/dashboard-insights";
import { hasDashboardPermission } from "@/core/authorization/dashboard-access";
import {
  getDashboardContentViews,
  getEnabledContentViewModuleKeys,
  getModuleReport,
  getReportsOverview,
} from "@/features/reports/application/reports.service";
import type { ContentViewsSummary } from "@/features/reports/domain/content-views.contracts";
import { filterContentViewsSummary } from "@/features/reports/domain/content-views.contracts";
import type { ReportQuery } from "@/features/reports/domain/reports.contracts";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";

const dashboardReportQuery: ReportQuery = {
  period: "last_30_days",
  group_by: "day",
  compare: "none",
  timezone: "Africa/Cairo",
};

export default async function DashboardPage() {
  const actor = await requireDashboardPermission("dashboard.view");
  let insights: DashboardLandingInsights | null = null;
  let contentViews: ContentViewsSummary | null = null;
  const enabledViewModules = getEnabledContentViewModuleKeys();
  const contentViewsRequest = getDashboardContentViews();

  if (hasDashboardPermission(actor, "reports.view")) {
    const [overview, feedback, views] = await Promise.all([
      getReportsOverview(dashboardReportQuery),
      getModuleReport("feedback", dashboardReportQuery),
      contentViewsRequest,
    ]);
    if (overview.success) {
      insights = buildDashboardInsights(
        overview.data,
        feedback.success ? feedback.data : null,
      );
    }
    if (views.success && views.data) {
      contentViews = filterContentViewsSummary(views.data, enabledViewModules);
    }
  } else {
    const views = await contentViewsRequest;
    if (views.success && views.data) {
      contentViews = filterContentViewsSummary(views.data, enabledViewModules);
    }
  }

  return (
    <DashboardLandingView insights={insights} contentViews={contentViews} />
  );
}
