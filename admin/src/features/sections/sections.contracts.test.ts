import { describe, expect, it } from "vitest";

import {
  backendSectionModules,
  formatSectionDate,
  getSectionModuleLabel,
  managedSectionModules,
  normalizeSectionQuery,
  sectionFormSchema,
  sectionPageSchema,
} from "./sections.contracts";

describe("sections contracts", () => {
  it("keeps the backend vocabulary while exposing only used content modules", () => {
    expect(backendSectionModules).toEqual([
      "articles",
      "books",
      "visuals",
      "galleries",
      "gallery_media",
    ]);
    expect(managedSectionModules).toEqual(["articles", "books", "visuals"]);
    expect(getSectionModuleLabel("articles")).toBe("المقالات");
    expect(getSectionModuleLabel("books")).toBe("الكتب");
    expect(getSectionModuleLabel("visuals")).toBe("المرئيات");
    expect(getSectionModuleLabel("gallery_media")).toBe("موديول غير معروض");
    expect(getSectionModuleLabel(null)).toBe("قسم قديم غير محدد");
  });

  it("validates create and edit values without allowing backend-only modules", () => {
    expect(
      sectionFormSchema.safeParse({
        name: " أخبار ",
        module: "articles",
        description: "",
        is_active: true,
      }).success,
    ).toBe(true);
    expect(
      sectionFormSchema.safeParse({
        name: "Gallery",
        module: "galleries",
        description: null,
        is_active: true,
      }).success,
    ).toBe(false);
    expect(
      sectionFormSchema.safeParse({
        name: "",
        module: "books",
        description: null,
        is_active: true,
      }).success,
    ).toBe(false);
  });

  it("normalizes supported server-side query values and rejects unsafe URLs safely", () => {
    expect(
      normalizeSectionQuery({
        search: "  news ",
        module: "articles",
        page: "3",
      }),
    ).toEqual({ search: "news", module: "articles", page: 3 });
    expect(
      normalizeSectionQuery({ module: "unsupported", page: "-4" }),
    ).toEqual({ page: 1 });
  });

  it("maps the real Laravel pagination envelope", () => {
    const result = sectionPageSchema.parse({
      current_page: 1,
      data: [
        {
          id: 1,
          name: "News",
          slug: "news",
          module: "articles",
          description: null,
          is_active: true,
        },
      ],
      last_page: 2,
      per_page: 20,
      total: 21,
      from: 1,
      to: 20,
    });
    expect(result.data[0]?.id).toBe("1");
    expect(result.last_page).toBe(2);
  });

  it("formats valid dates and degrades missing or invalid dates safely", () => {
    expect(formatSectionDate(null)).toBe("غير متاح");
    expect(formatSectionDate("invalid")).toBe("غير متاح");
    expect(formatSectionDate("2026-07-28T10:00:00Z")).not.toBe("غير متاح");
  });
});
