import { describe, expect, it } from "vitest";

import { compactBooksQuery } from "./books.query";

describe("Books query allowlist", () => {
  it("keeps only valid documented filters", () => {
    expect(
      compactBooksQuery({ section_id: 2, series_id: 3, type: "part", page: 4 }),
    ).toEqual({ section_id: 2, series_id: 3, type: "part", page: 4 });
  });

  it("drops undocumented, invalid, and empty values", () => {
    expect(
      compactBooksQuery({
        section_id: 0,
        series_id: Number.NaN,
        type: "invalid" as never,
        page: -1,
        search: "book",
        author: "name",
        source_type: "file",
        status: "active",
        date: "2026-01-01",
        slug: "book",
        per_page: 20,
      } as never),
    ).toEqual({});
  });
});
