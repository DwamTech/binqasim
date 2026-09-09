import { describe, expect, it } from "vitest";

import {
  libraryIndexSubmissionsHref,
  normalizeLibraryIndexSubmissionsQuery,
} from "./library-indexes.query";

describe("library index submissions query", () => {
  it("allowlists supported filters and applies bounded pagination", () => {
    expect(
      normalizeLibraryIndexSubmissionsQuery({
        type: "golden_visit",
        status: "pending",
        search: "  عبدالله  ",
        page: "2",
        per_page: "50",
        private: "ignored",
      }),
    ).toEqual({
      type: "golden_visit",
      status: "pending",
      search: "عبدالله",
      page: 2,
      per_page: 50,
    });
  });

  it("falls back safely for malformed query strings", () => {
    expect(
      normalizeLibraryIndexSubmissionsQuery({
        type: "unknown",
        page: "-1",
        per_page: "1000",
      }),
    ).toEqual({ page: 1, per_page: 20 });
  });

  it("preserves active filters in pagination links and can clear them", () => {
    const query = {
      type: "guest" as const,
      status: "approved" as const,
      search: "باحث",
      page: 1,
      per_page: 20,
    };
    expect(libraryIndexSubmissionsHref(query, { page: 3 })).toBe(
      "/dashboard/library-indexes?type=guest&status=approved&search=%D8%A8%D8%A7%D8%AD%D8%AB&page=3",
    );
    expect(
      libraryIndexSubmissionsHref(query, {
        type: "",
        status: "",
        search: "",
      }),
    ).toBe("/dashboard/library-indexes");
  });
});
