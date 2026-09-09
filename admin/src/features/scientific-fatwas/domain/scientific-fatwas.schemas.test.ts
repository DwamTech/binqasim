import { describe, expect, it } from "vitest";
import {
  scientificFatwaDetailSchema,
  scientificFatwaPageSchema,
} from "./scientific-fatwas.schemas";

const item = {
  id: 7,
  slug: "hadith-ruling",
  title: "ضوابط الحكم على الحديث",
  category: "علل الحديث",
  category_id: 4,
  category_option: { id: 4, name: "علل الحديث", slug: "hadith-defects" },
  question: "ما الضابط العلمي في الحكم على الحديث؟",
  answer: "ينظر الباحث في الطرق والقرائن وأقوال الأئمة النقاد.",
  date_label: "١٢ رجب ١٤٤٦هـ",
  sources: ["مقدمة ابن الصلاح"],
  keywords: ["العلل"],
  is_featured: 1,
  is_listed: 0,
  source_fatwa_id: 12,
  managed_by_inbox: 1,
  is_published: true,
  status: "published",
  published_at: "2026-08-06T00:00:00Z",
};

describe("scientific fatwa runtime schemas", () => {
  it("normalizes identifiers and booleans", () => {
    expect(scientificFatwaDetailSchema.parse({ data: item })).toMatchObject({
      id: "7",
      is_featured: true,
      is_listed: false,
      category_id: "4",
      source_fatwa_id: "12",
      managed_by_inbox: true,
      sources: ["مقدمة ابن الصلاح"],
    });
  });

  it("accepts the exact resource pagination envelope", () => {
    const page = scientificFatwaPageSchema.parse({
      data: [item],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
      filter_options: {
        categories: ["علل الحديث"],
        category_options: [
          { id: 4, name: "علل الحديث", slug: "hadith-defects" },
        ],
        statuses: ["published", "scheduled", "draft"],
      },
      stats: { total: 1, published: 1, scheduled: 0, drafts: 0 },
    });
    expect(page.current_page).toBe(1);
    expect(page.data[0]?.id).toBe("7");
  });
});
