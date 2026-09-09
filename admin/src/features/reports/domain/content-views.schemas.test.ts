import { describe, expect, it } from "vitest";

import { filterContentViewsSummary } from "./content-views.contracts";
import { dashboardSummaryEnvelopeSchema } from "./content-views.schemas";

describe("dashboard content views contract", () => {
  it("accepts and validates the six-module views summary", () => {
    const result = dashboardSummaryEnvelopeSchema.parse({
      status: "success",
      data: {
        total_articles: 4,
        content_views: {
          total: 31,
          modules: [
            {
              key: "articles",
              label: "Articles",
              items_count: 4,
              views_count: 31,
            },
          ],
        },
      },
    });

    expect(result.data.content_views?.total).toBe(31);
  });

  it("keeps an older dashboard summary response valid during deployment", () => {
    const result = dashboardSummaryEnvelopeSchema.parse({
      status: "success",
      data: { total_articles: 4 },
    });

    expect(result.data.content_views).toBeUndefined();
  });

  it("recalculates the total after deployment flags hide shared modules", () => {
    expect(
      filterContentViewsSummary(
        {
          total: 90,
          modules: [
            {
              key: "articles",
              label: "Articles",
              items_count: 2,
              views_count: 20,
            },
            {
              key: "scientific_library",
              label: "Library",
              items_count: 3,
              views_count: 70,
            },
          ],
        },
        ["articles"],
      ),
    ).toEqual({
      total: 20,
      modules: [
        {
          key: "articles",
          label: "Articles",
          items_count: 2,
          views_count: 20,
        },
      ],
    });
  });
});
