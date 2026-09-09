import { describe, expect, it } from "vitest";

import { normalizeReportQuery } from "./reports.query";

describe("report query", () => {
  it("uses safe defaults for invalid filters", () => {
    expect(
      normalizeReportQuery({
        period: "bad",
        group_by: "hour",
        compare: "bad",
      }),
    ).toEqual({
      period: "last_30_days",
      group_by: "day",
      compare: "none",
      timezone: "Africa/Cairo",
    });
  });

  it("keeps valid custom dates only", () => {
    expect(
      normalizeReportQuery({
        period: "custom",
        date_from: "2026-07-01",
        date_to: "2026-07-31",
        group_by: "week",
        compare: "previous_period",
      }),
    ).toMatchObject({
      period: "custom",
      date_from: "2026-07-01",
      date_to: "2026-07-31",
      group_by: "week",
      compare: "previous_period",
    });
  });
});
