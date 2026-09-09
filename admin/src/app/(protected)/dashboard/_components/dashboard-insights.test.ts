import { describe, expect, it } from "vitest";

import type {
  ReportMetric,
  ReportPayload,
} from "@/features/reports/domain/reports.contracts";

import { buildDashboardInsights } from "./dashboard-insights";

function report(metrics: Array<Pick<ReportMetric, "key" | "value" | "available">>) {
  return {
    generated_at: "2026-07-31T02:00:00Z",
    sections: [
      {
        key: "summary",
        label: "Summary",
        description: null,
        warnings: [],
        metrics: metrics.map((metric) => ({
          ...metric,
          label: metric.key,
          description: "",
          formatted_value: null,
          type: "count",
          availability_status: metric.available ? "available" : "unavailable",
          quality: "complete",
          sensitivity: "internal",
          reason: null,
          comparison: null,
          warnings: [],
        })),
      },
    ],
    report_key: "reports.overview",
    period: {
      key: "last_30_days",
      date_from: "2026-07-01",
      date_to: "2026-07-31",
      timezone: "Africa/Cairo",
      group_by: "day",
      compare: "none",
      starts_at_utc: "2026-07-01T00:00:00Z",
      ends_at_utc: "2026-07-31T23:59:59Z",
      previous_starts_at_utc: null,
      previous_ends_at_utc: null,
    },
    warnings: [],
  } satisfies ReportPayload;
}

describe("dashboard insights", () => {
  it("uses available report values and preserves unavailable indicators", () => {
    const overview = report([
      { key: "content.total_articles", value: 8, available: true },
      { key: "content.total_books", value: 3, available: true },
      { key: "content.total_visuals", value: 2, available: true },
      { key: "content.total_galleries", value: 4, available: true },
      { key: "content.published_articles", value: null, available: false },
      { key: "users.new_in_period", value: 5, available: true },
    ]);
    const feedback = report([
      { key: "feedback.average_rating", value: 4.6, available: true },
    ]);

    const insights = buildDashboardInsights(overview, feedback);

    expect(insights.totalContent).toBe(17);
    expect(insights.publishedArticles).toBeNull();
    expect(insights.satisfaction).toBe(4.6);
    expect(insights.newUsers).toBe(5);
    expect(insights.distribution).toEqual([
      { label: "المقالات", value: 8 },
      { label: "الكتب", value: 3 },
      { label: "المرئيات", value: 2 },
      { label: "معرض الوسائط", value: 4 },
    ]);
  });
});
