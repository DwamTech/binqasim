import { describe, expect, it } from "vitest";

import {
  normalizeScientificLibraryQuery,
  readScientificLibraryId,
  scientificLibraryListHref,
} from "./scientific-library.query";

describe("scientific library query contract", () => {
  it("keeps every supported management filter", () => {
    expect(
      normalizeScientificLibraryQuery({
        search: "  الحديث  ",
        content_type: "كتاب",
        scientific_field: "مصطلح الحديث",
        status: "scheduled",
        source_type: "embed",
        is_featured: "1",
        page: "3",
        per_page: "40",
        ignored: "value",
      }),
    ).toEqual({
      search: "الحديث",
      content_type: "كتاب",
      scientific_field: "مصطلح الحديث",
      status: "scheduled",
      source_type: "embed",
      is_featured: "1",
      page: 3,
      per_page: 40,
    });
  });

  it("falls back safely for invalid filters and builds stable pagination URLs", () => {
    expect(
      normalizeScientificLibraryQuery({ status: "hidden", page: "-1" }),
    ).toEqual({ page: 1, per_page: 20 });
    expect(
      scientificLibraryListHref(
        {
          search: "حديث",
          status: "draft",
          source_type: "file",
          page: 1,
          per_page: 20,
        },
        { page: 2 },
      ),
    ).toBe(
      "/dashboard/library?search=%D8%AD%D8%AF%D9%8A%D8%AB&status=draft&source_type=file&page=2",
    );
  });

  it("accepts numeric route identifiers only", () => {
    expect(readScientificLibraryId("42")).toBe("42");
    expect(readScientificLibraryId("../42")).toBeUndefined();
    expect(readScientificLibraryId("slug")).toBeUndefined();
  });
});
