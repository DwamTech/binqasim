import { describe, expect, it } from "vitest";

import {
  scientificLibraryDetailResponseSchema,
  scientificLibraryOptionsResponseSchema,
  scientificLibraryPageSchema,
} from "./scientific-library.schemas";

const item = {
  id: 7,
  slug: "hadith-work",
  title: "مصنَّف في الحديث",
  short_title: "مصنَّف الحديث",
  author_name: "المؤلف",
  description: "وصف موثق",
  content_type: "الكتب والمؤلفات",
  scientific_field: "مصطلح الحديث",
  pages_count: "248",
  edition: "الطبعة الأولى",
  publication_info: null,
  source_type: "embed",
  file_path: null,
  source_link: "https://drive.google.com/file/d/example/preview",
  source_url: null,
  reader_url: "https://drive.google.com/file/d/example/preview",
  download_url: null,
  cover_path: null,
  cover_url: null,
  keywords: '["الحديث","المصطلح"]',
  download_allowed: 0,
  is_featured: "1",
  is_published: true,
  published_at: "2026-08-10T12:00:00Z",
  views_count: "12",
  created_at: "2026-08-01T12:00:00Z",
  updated_at: null,
};

describe("scientific library response schemas", () => {
  it("normalizes the documented admin item and private preview additions", () => {
    const result = scientificLibraryDetailResponseSchema.parse({
      data: { ...item, admin_file_url: "/api/admin/preview/7" },
    });
    expect(result.id).toBe("7");
    expect(result.pages_count).toBe(248);
    expect(result.source_type).toBe("embed");
    expect(result.keywords).toEqual(["الحديث", "المصطلح"]);
    expect(result.is_featured).toBe(true);
    expect(result.admin_file_url).toBe("/api/admin/preview/7");
  });

  it("accepts the Laravel resource paginator envelope only", () => {
    const page = scientificLibraryPageSchema.parse({
      data: [item],
      links: { first: null, last: null, prev: null, next: null },
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 1,
        from: 1,
        to: 1,
      },
    });
    expect(page.meta.total).toBe(1);
    expect(
      scientificLibraryPageSchema.safeParse({
        current_page: 1,
        data: [item],
        total: 1,
      }).success,
    ).toBe(false);
  });

  it("normalizes string and object options without hard-coding response shape", () => {
    const options = scientificLibraryOptionsResponseSchema.parse({
      data: {
        content_types: ["كتاب", { value: "بحث", label: "بحث محكم" }],
        scientific_fields: [{ key: "hadith", label: "علوم الحديث" }],
        source_types: ["file", "embed"],
        statuses: ["draft", "scheduled", "published"],
      },
    });
    expect(options.content_types).toEqual([
      { value: "كتاب", label: "كتاب" },
      { value: "بحث", label: "بحث محكم" },
    ]);
    expect(options.scientific_fields[0]).toEqual({
      value: "hadith",
      label: "علوم الحديث",
    });
  });

  it("rejects malformed required item fields and unknown source types", () => {
    expect(
      scientificLibraryDetailResponseSchema.safeParse({
        data: { ...item, title: "", source_type: "unsafe" },
      }).success,
    ).toBe(false);
  });
});
