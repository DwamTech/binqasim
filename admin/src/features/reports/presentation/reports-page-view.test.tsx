import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { dashboardCopy } from "@/core/config/dashboard-copy";

import type {
  ReportMetric,
  ReportPayload,
  ReportQuery,
} from "../domain/reports.contracts";
import { reportModules } from "../domain/reports.contracts";

import { ReportsPageView } from "./reports-page-view";

function metric(key: string, value: unknown): ReportMetric {
  return {
    key,
    label: "English backend label",
    description: "English backend description",
    value,
    formatted_value: "English formatted value",
    type: "count",
    available: true,
    availability_status: "available",
    quality: "complete",
    sensitivity: "internal",
    reason: null,
    comparison: null,
    warnings: ["English warning"],
  };
}

const query: ReportQuery = {
  period: "last_30_days",
  group_by: "day",
  compare: "none",
  timezone: "Africa/Cairo",
};

const report: ReportPayload = {
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
  sections: [
    {
      key: "content",
      label: "Content",
      description: "Backend content description",
      metrics: [metric("content.total_articles", 12)],
      warnings: [],
    },
    {
      key: "system",
      label: "System",
      description: "System health",
      metrics: [metric("system.activity_volume", 99)],
      warnings: [],
    },
    {
      key: "notifications",
      label: "Notifications",
      description: "Notification details",
      metrics: [metric("notifications.total", 15)],
      warnings: [],
    },
  ],
  warnings: ["Backend warning"],
  generated_at: "2026-07-31T02:00:00Z",
};

describe("reports page view", () => {
  it("renders Arabic business data without technical or backend text", () => {
    const markup = renderToStaticMarkup(
      <ReportsPageView report={report} query={query} />,
    );
    const visibleText = markup
      .replace(/<[^>]*>/g, " ")
      .replace(/&[a-z]+;/gi, " ");

    expect(visibleText).toContain("إجمالي المقالات");
    expect(visibleText).not.toContain("صحة النظام");
    expect(visibleText).not.toContain("الإشعارات");
    expect(visibleText).not.toMatch(/[A-Za-z]/);
  });

  it("calculates satisfaction from the real rating average and click distribution", () => {
    const markup = renderToStaticMarkup(
      <ReportsPageView
        report={report}
        query={query}
        satisfaction={metric("feedback.average_rating", 4)}
        satisfactionDistribution={metric("feedback.rating_distribution", {
          1: 1,
          5: 3,
        })}
      />,
    );
    const visibleText = markup.replace(/<[^>]*>/g, " ");

    expect(visibleText).toContain("قياس رضا المستفيدين");
    expect(visibleText).toContain("٨٠٪");
    expect(visibleText).toContain("إجمالي التقييمات: ٤");
    expect(visibleText).toContain("٣ تقييم");
    expect(visibleText).toContain("١ تقييم");
  });

  it("renders aggregate views for enabled modules with deployment labels", () => {
    const contentReport: ReportPayload = {
      ...report,
      report_key: "reports.analytics.content",
      sections: [
        {
          key: "content_performance",
          label: "Content performance",
          description: null,
          warnings: [],
          metrics: [
            metric("content.total_views", 44),
            metric("content.views_by_module", [
              {
                key: "articles",
                label: "Untrusted backend label",
                items_count: 3,
                views_count: 12,
              },
              {
                key: "scientific_library",
                label: "Untrusted library label",
                items_count: 5,
                views_count: 32,
              },
            ]),
          ],
        },
      ],
    };

    const markup = renderToStaticMarkup(
      <ReportsPageView
        definition={reportModules.content}
        report={contentReport}
        query={query}
        enabledContentViewModules={["articles", "scientific_library"]}
      />,
    );
    const visibleText = markup.replace(/<[^>]*>/g, " ");

    expect(visibleText).toContain("إجمالي مشاهدات المحتوى");
    expect(visibleText).toContain("مشاهدات الموديولات المفعّلة");
    expect(visibleText).toContain("المقالات");
    expect(visibleText).toContain(dashboardCopy.modules.library.navigation);
    expect(visibleText).toContain("٣٢");
    expect(visibleText).not.toContain("Untrusted backend label");
  });
});
