import { describe, expect, it } from "vitest";

import {
  emptyScientificVideoForm,
  resolveScientificVideoOptions,
  scientificVideoDetailSchema,
  scientificVideoPageSchema,
  validateScientificVideoForm,
} from "./scientific-videos";

const item = {
  id: 7,
  slug: "lesson-one",
  category: "محاضرة علمية",
  title: "مدخل إلى علم الحديث",
  description: "وصف المادة المرئية",
  duration_minutes: 42,
  duration_label: "42 دقيقة",
  date_label: "١٤٤٧هـ",
  source_type: "link",
  video_path: null,
  source_link: "https://example.test/video.mp4",
  source_url: "https://example.test/video.mp4",
  watch_url: "https://example.test/video.mp4",
  embed_url: null,
  admin_file_url: null,
  thumbnail_path: null,
  thumbnail_url: null,
  keywords: ["الحديث"],
  download_allowed: false,
  is_featured: true,
  is_published: true,
  status: "published",
  published_at: "2026-08-06T10:00:00.000000Z",
  views_count: 11,
  created_at: "2026-08-06T09:00:00.000000Z",
  updated_at: "2026-08-06T10:00:00.000000Z",
};

describe("scientific videos dashboard contracts", () => {
  it("normalizes Laravel resource identifiers, booleans, and paginator metadata", () => {
    expect(scientificVideoDetailSchema.parse({ data: item })).toMatchObject({
      id: "7",
      download_allowed: false,
      is_featured: true,
      status: "published",
    });
    expect(
      scientificVideoPageSchema.parse({
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
      }).meta.total,
    ).toBe(1);
  });

  it("uses safe fallback options when an older backend has no catalogue", () => {
    const options = resolveScientificVideoOptions();

    expect(options.categories.length).toBeGreaterThan(0);
    expect(options.source_types.map(({ value }) => value)).toEqual([
      "file",
      "link",
      "embed",
    ]);
  });

  it("requires a secure source and all card fields before submission", () => {
    const valid = {
      ...emptyScientificVideoForm,
      title: "مادة مرئية",
      description: "وصف علمي واضح للمادة",
      duration_minutes: "30",
      date_label: "١٤٤٧هـ",
      source_link: "https://example.test/video.mp4",
    };

    expect(validateScientificVideoForm(valid, {})).toEqual({});
    expect(
      validateScientificVideoForm(
        { ...valid, source_link: "http://example.test/video.mp4" },
        {},
      ).source_link,
    ).toBeDefined();
    expect(
      validateScientificVideoForm(
        { ...valid, source_type: "file", source_link: "" },
        {},
      ).video_file,
    ).toBeDefined();
  });
});
