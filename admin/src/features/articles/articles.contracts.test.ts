import { describe, expect, it } from "vitest";

import {
  articleDetailResponseSchema,
  articleMutationResponseSchema,
  articlePageSchema,
  articleSchema,
} from "./articles.contracts";

export const articleFixture = {
  id: 1,
  user_id: 7,
  title: "مقال تجريبي",
  slug: "sample-article",
  excerpt: null,
  content: "محتوى آمن",
  author_name: "كاتب",
  status: "draft",
  section: {
    id: 3,
    name: "الأخبار",
    slug: "news",
    module: "articles",
    is_active: true,
  },
  author: {
    id: 7,
    name: "Author",
    email: "author@example.com",
    role: "author",
  },
  featured_image: null,
  media: [
    {
      id: 4,
      type: "file",
      original_name: "doc.pdf",
      mime_type: "application/pdf",
      size: 100,
      sort_order: 0,
      url: "https://cms.test/storage/doc.pdf",
    },
  ],
  gregorian_date: "2026-07-28",
  hijri_date: null,
  duration: null,
  location: null,
  references: null,
  keywords: null,
  published_at: null,
  views_count: 0,
  created_at: "2026-07-28T10:00:00Z",
  updated_at: "2026-07-28T10:00:00Z",
};

describe("articles contracts", () => {
  it("validates summary, detail, media and pagination resources", () => {
    expect(articleSchema.parse(articleFixture).id).toBe("1");
    expect(
      articleDetailResponseSchema.parse({ data: articleFixture }).data.media[0]
        ?.id,
    ).toBe("4");
    expect(
      articlePageSchema.parse({
        data: [articleFixture],
        links: { first: null, last: null, prev: null, next: null },
        meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
      }).meta.total,
    ).toBe(1);
  });

  it("rejects unknown statuses, invalid media URLs and missing safe author IDs", () => {
    expect(
      articleSchema.safeParse({ ...articleFixture, status: "hidden" }).success,
    ).toBe(false);
    expect(
      articleSchema.safeParse({
        ...articleFixture,
        media: [{ ...articleFixture.media[0], url: "internal/path" }],
      }).success,
    ).toBe(false);
    expect(
      articleSchema.safeParse({
        ...articleFixture,
        author: { name: "Unsafe", password: "secret" },
      }).success,
    ).toBe(false);
  });

  it("never includes secret or internal path fields in the parsed contract", () => {
    const parsed = articleSchema.parse({
      ...articleFixture,
      password: "secret",
      access_token: "secret",
      internal_path: "/srv/private",
    });
    expect(JSON.stringify(parsed)).not.toMatch(
      /password|remember_token|access_token|plain_text_token|authorization|cms_session|internal_path|disk_path/,
    );
  });

  it("accepts locally hosted images and rich content in mutation responses", () => {
    const parsed = articleMutationResponseSchema.parse({
      message: "Article created successfully",
      article: {
        ...articleFixture,
        slug: "تجربة-مقال",
        content: "<p>محتوى المقال</p>",
        featured_image:
          "http://127.0.0.1:8000/storage/articles/2026/07/cover.jpg",
        published_at: "2026-07-30T21:08:18.000000Z",
      },
    });

    expect(parsed.article.featured_image).toContain("127.0.0.1:8000");
  });
});
