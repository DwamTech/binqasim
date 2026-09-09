import { describe, expect, it } from "vitest";
import {
  createPageInputSchema,
  laravelPagePreviewResponseSchema,
  pagePreviewResponseSchema,
  savePageDraftInputSchema,
} from "./pages.contracts";

describe("Pages dashboard contracts", () => {
  it("keeps Laravel relative Preview input separate from the absolute Dashboard contract", () => {
    const token = "a".repeat(64);
    const upstream = {
      data: {
        token,
        expires_at: "2026-08-28T12:00:00Z",
        preview_url: `/pages-preview/${token}`,
      },
    };

    expect(laravelPagePreviewResponseSchema.safeParse(upstream).success).toBe(
      true,
    );
    expect(pagePreviewResponseSchema.safeParse(upstream).success).toBe(false);
    expect(
      pagePreviewResponseSchema.safeParse({
        data: {
          ...upstream.data,
          preview_url: `https://public.example.com/pages-preview/${token}`,
        },
      }).success,
    ).toBe(true);
  });

  it("keeps Hero JSON bounded to hero@1 fields and stable media IDs", () => {
    const result = savePageDraftInputSchema.safeParse({
      title: "About",
      seo_data: { description: "kept" },
      content: {
        schema_version: 1,
        sections: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            type: "hero",
            version: 1,
            is_visible: true,
            data: {
              variant: "image_left",
              title: "Hero",
              image: { media_id: 12, alt: "Alt" },
            },
            settings: { theme: "dark", spacing: "large" },
          },
        ],
      },
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.content.sections[0]?.type === "hero")
      expect(result.data.content.sections[0].data.image).toEqual({
        media_id: 12,
        alt: "Alt",
      });
  });
  it("does not normalize an invalid administrator slug", () => {
    expect(
      createPageInputSchema.safeParse({ title: "About", slug: "About Us" })
        .success,
    ).toBe(true);
  });

  it("accepts only the three new bounded component contracts beside Hero", () => {
    const base = {
      id: "22222222-2222-4222-8222-222222222222",
      version: 1,
      is_visible: true,
      settings: { theme: "default", spacing: "medium" },
    };
    const result = savePageDraftInputSchema.safeParse({
      title: "Components",
      seo_data: { title: "Preserved" },
      content: {
        schema_version: 1,
        sections: [
          { ...base, type: "rich_content", data: { html: "<p>Text</p>" } },
          {
            ...base,
            id: "33333333-3333-4333-8333-333333333333",
            type: "image",
            data: {
              variant: "wide",
              image: { media_id: 12, alt: "Alternative" },
              caption: null,
            },
          },
          {
            ...base,
            id: "44444444-4444-4444-8444-444444444444",
            type: "image_text",
            data: {
              variant: "image_right",
              title: "Heading",
              html: "<p>Text</p>",
              image: { media_id: 12, alt: "Alternative" },
            },
          },
        ],
      },
    });
    expect(result.success).toBe(true);
    expect(
      savePageDraftInputSchema.safeParse({
        title: "Bad",
        seo_data: {},
        content: {
          schema_version: 1,
          sections: [
            {
              ...base,
              type: "image",
              data: {
                variant: "wide",
                image: { media_id: 1, alt: "Alt" },
                url: "/storage/no",
              },
            },
          ],
        },
      }).success,
    ).toBe(false);
  });

  it("accepts bounded video audio and gallery media contracts", () => {
    const base = {
      id: "55555555-5555-4555-8555-555555555555",
      version: 1,
      is_visible: true,
      settings: { theme: "default", spacing: "medium" },
    };
    expect(
      savePageDraftInputSchema.safeParse({
        title: "Media",
        seo_data: {},
        content: {
          schema_version: 1,
          sections: [
            {
              ...base,
              type: "video",
              data: {
                variant: "wide",
                video: { media_id: 1 },
                poster: { media_id: 2, alt: "Poster" },
              },
            },
            {
              ...base,
              id: "66666666-6666-4666-8666-666666666666",
              type: "audio",
              data: { audio: { media_id: 3 } },
            },
            {
              ...base,
              id: "77777777-7777-4777-8777-777777777777",
              type: "gallery",
              data: {
                variant: "grid",
                items: [
                  {
                    id: "88888888-8888-4888-8888-888888888888",
                    media_id: 4,
                    alt: "Image",
                    caption: null,
                  },
                ],
              },
            },
          ],
        },
      }).success,
    ).toBe(true);
  });

  it("accepts the closed FAQ and CTA editor contracts without adding media fields", () => {
    const base = {
      version: 1,
      is_visible: false,
      settings: { theme: "secondary", spacing: "small" },
    };
    const result = savePageDraftInputSchema.safeParse({
      title: "FAQ and CTA",
      seo_data: { title: "unchanged" },
      content: {
        schema_version: 1,
        sections: [
          {
            ...base,
            id: "99999999-9999-4999-8999-999999999999",
            type: "faq",
            data: {
              variant: "stacked",
              title: "Questions",
              description: null,
              items: [
                {
                  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                  question: "Question?",
                  answer: "<p>Answer</p>",
                },
              ],
            },
          },
          {
            ...base,
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            is_visible: true,
            type: "cta",
            data: {
              variant: "split",
              title: "Act now",
              description: "Description",
              primary_action: { label: "Contact", url: "/contact" },
              secondary_action: null,
            },
          },
        ],
      },
    });

    expect(result.success).toBe(true);
    expect(
      savePageDraftInputSchema.safeParse({
        title: "Invalid FAQ",
        seo_data: {},
        content: {
          schema_version: 1,
          sections: [
            {
              ...base,
              id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
              type: "faq",
              data: { variant: "accordion", items: [] },
            },
          ],
        },
      }).success,
    ).toBe(false);
    expect(
      savePageDraftInputSchema.safeParse({
        title: "Invalid CTA",
        seo_data: {},
        content: {
          schema_version: 1,
          sections: [
            {
              ...base,
              id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
              type: "cta",
              data: {
                variant: "banner",
                title: "CTA",
                primary_action: { label: "", url: "" },
                media_id: 1,
              },
            },
          ],
        },
      }).success,
    ).toBe(false);
  });
});
