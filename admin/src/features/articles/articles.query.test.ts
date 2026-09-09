import { describe, expect, it } from "vitest";

import { articleQueryParams, normalizeArticleQuery } from "./articles.query";

describe("article list query", () => {
  it("normalizes every server-side filter and pagination value", () => {
    const query = normalizeArticleQuery({
      search: "  news  ",
      section_id: "2",
      status: "draft",
      author: "7",
      date: "2026-07-28",
      page: "3",
      per_page: "50",
    });
    expect(query).toEqual({
      search: "news",
      section_id: "2",
      status: "draft",
      author: "7",
      date: "2026-07-28",
      page: 3,
      per_page: 50,
    });
    expect(articleQueryParams(query).toString()).toContain("search=news");
  });

  it("fails closed to defaults for malformed filters", () => {
    expect(
      normalizeArticleQuery({
        status: "unknown",
        page: "0",
        per_page: "999",
      }),
    ).toEqual({ page: 1, per_page: 20 });
  });
});
