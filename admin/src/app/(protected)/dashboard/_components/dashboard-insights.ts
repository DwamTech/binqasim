import type { ReportPayload } from "@/features/reports/domain/reports.contracts";
import { dashboardCopy } from "@/core/config/dashboard-copy";

import type { DashboardLandingInsights } from "./dashboard-landing-view";

function metricNumber(report: ReportPayload, key: string): number | null {
  const metric = report.sections
    .flatMap((section) => section.metrics)
    .find((item) => item.key === key);
  return metric?.available && typeof metric.value === "number"
    ? metric.value
    : null;
}

export function buildDashboardInsights(
  overview: ReportPayload,
  feedback: ReportPayload | null,
): DashboardLandingInsights {
  const contentMetrics = [
    [dashboardCopy.modules.articles.plural, "content.total_articles"],
    ["الكتب", "content.total_books"],
    ["المرئيات", "content.total_visuals"],
    ["معرض الوسائط", "content.total_galleries"],
  ] as const;
  const distribution = contentMetrics.map(([label, key]) => ({
    label,
    value: metricNumber(overview, key) ?? 0,
  }));
  const totalContentKeys = [
    "content.total_articles",
    "content.total_books",
    "content.total_documents",
    "content.total_issues",
    "content.total_galleries",
    "content.total_visuals",
    "content.total_audios",
  ];

  return {
    generatedAt: overview.generated_at,
    totalContent: totalContentKeys.reduce(
      (total, key) => total + (metricNumber(overview, key) ?? 0),
      0,
    ),
    publishedArticles: metricNumber(
      overview,
      "content.published_articles",
    ),
    satisfaction: feedback
      ? metricNumber(feedback, "feedback.average_rating")
      : null,
    newUsers: metricNumber(overview, "users.new_in_period"),
    distribution,
  };
}
