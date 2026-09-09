import { z } from "zod";

export const pageStatuses = ["draft", "published", "archived"] as const;
export type PageStatus = (typeof pageStatuses)[number];

export const heroVariants = [
  "centered",
  "image_left",
  "image_right",
  "background_image",
] as const;
export const heroThemes = [
  "default",
  "light",
  "primary",
  "secondary",
  "dark",
] as const;
export const heroSpacing = ["none", "small", "medium", "large", "xl"] as const;

export type PageSeoData = Record<string, unknown> | unknown[];

const identifier = z.number().int().positive();
const seoData = z.union([
  z.record(z.string(), z.unknown()),
  z.array(z.unknown()),
]);
const absoluteHttpUrl = z
  .string()
  .url()
  .refine((value) => {
    try {
      const url = new URL(value);

      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        url.username === "" &&
        url.password === ""
      );
    } catch {
      return false;
    }
  }, "must be an absolute http(s) URL without credentials");
const pageParentSchema = z.object({
  id: identifier,
  title: z.string(),
  path: z.string(),
});

export const pageMediaSchema = z.object({
  id: identifier,
  type: z.enum(["image", "video", "audio", "document"]),
  url: z.string().url(),
  mime_type: z.string(),
  name: z.string(),
  size: z.number().int().nonnegative(),
});

const actionSchema = z.object({ label: z.string(), url: z.string() }).strict();
const componentSettingsSchema = z
  .object({
    theme: z.enum(heroThemes),
    spacing: z.enum(heroSpacing),
  })
  .strict();
export const heroSectionSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal("hero"),
    version: z.literal(1),
    is_visible: z.boolean(),
    data: z
      .object({
        variant: z.enum(heroVariants),
        title: z.string(),
        description: z.string().nullable().optional(),
        image: z
          .object({
            media_id: identifier,
            alt: z.string().nullable().optional(),
          })
          .nullable()
          .optional(),
        primary_action: actionSchema.nullable().optional(),
        secondary_action: actionSchema.nullable().optional(),
      })
      .strict(),
    settings: componentSettingsSchema,
  })
  .strict();

export const richContentSectionSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal("rich_content"),
    version: z.literal(1),
    is_visible: z.boolean(),
    data: z.object({ html: z.string().min(1).max(100000) }).strict(),
    settings: componentSettingsSchema,
  })
  .strict();

export const imageSectionSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal("image"),
    version: z.literal(1),
    is_visible: z.boolean(),
    data: z
      .object({
        variant: z.enum(["contained", "wide", "full_width"]),
        image: z
          .object({ media_id: identifier, alt: z.string().min(1).max(500) })
          .strict(),
        caption: z.string().max(1000).nullable().optional(),
      })
      .strict(),
    settings: componentSettingsSchema,
  })
  .strict();

export const imageTextSectionSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal("image_text"),
    version: z.literal(1),
    is_visible: z.boolean(),
    data: z
      .object({
        variant: z.enum(["image_left", "image_right"]),
        title: z.string().max(255).nullable().optional(),
        html: z.string().min(1).max(100000),
        image: z
          .object({ media_id: identifier, alt: z.string().min(1).max(500) })
          .strict(),
      })
      .strict(),
    settings: componentSettingsSchema,
  })
  .strict();

export const videoSectionSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal("video"),
    version: z.literal(1),
    is_visible: z.boolean(),
    data: z
      .object({
        variant: z.enum(["contained", "wide", "full_width"]),
        video: z.object({ media_id: identifier }).strict(),
        title: z.string().max(255).nullable().optional(),
        caption: z.string().max(1000).nullable().optional(),
        poster: z
          .object({ media_id: identifier, alt: z.string().min(1).max(500) })
          .strict()
          .nullable()
          .optional(),
      })
      .strict(),
    settings: componentSettingsSchema,
  })
  .strict();

export const audioSectionSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal("audio"),
    version: z.literal(1),
    is_visible: z.boolean(),
    data: z
      .object({
        audio: z.object({ media_id: identifier }).strict(),
        title: z.string().max(255).nullable().optional(),
        description: z.string().max(2000).nullable().optional(),
      })
      .strict(),
    settings: componentSettingsSchema,
  })
  .strict();

export const gallerySectionSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal("gallery"),
    version: z.literal(1),
    is_visible: z.boolean(),
    data: z
      .object({
        variant: z.enum(["grid", "masonry", "carousel"]),
        items: z
          .array(
            z
              .object({
                id: z.string().uuid(),
                media_id: identifier,
                alt: z.string().min(1).max(500),
                caption: z.string().max(1000).nullable().optional(),
              })
              .strict(),
          )
          .min(1)
          .max(50),
      })
      .strict(),
    settings: componentSettingsSchema,
  })
  .strict();
const itemId = z.string().uuid();
export const cardsSectionSchema = z
  .object({
    id: itemId,
    type: z.literal("cards"),
    version: z.literal(1),
    is_visible: z.boolean(),
    data: z
      .object({
        variant: z.enum(["grid_2", "grid_3", "grid_4"]),
        title: z.string().max(255).nullable().optional(),
        description: z.string().max(2000).nullable().optional(),
        items: z
          .array(
            z
              .object({
                id: itemId,
                title: z.string().min(1).max(255),
                description: z.string().max(2000).nullable().optional(),
                image: z
                  .object({
                    media_id: identifier,
                    alt: z.string().min(1).max(500),
                  })
                  .strict()
                  .nullable()
                  .optional(),
                action: actionSchema.nullable().optional(),
              })
              .strict(),
          )
          .min(1)
          .max(24),
      })
      .strict(),
    settings: componentSettingsSchema,
  })
  .strict();
export const statisticsSectionSchema = z
  .object({
    id: itemId,
    type: z.literal("statistics"),
    version: z.literal(1),
    is_visible: z.boolean(),
    data: z
      .object({
        variant: z.enum(["grid", "highlights"]),
        title: z.string().max(255).nullable().optional(),
        items: z
          .array(
            z
              .object({
                id: itemId,
                value: z.string().min(1).max(120),
                label: z.string().min(1).max(255),
                description: z.string().max(1000).nullable().optional(),
              })
              .strict(),
          )
          .min(1)
          .max(24),
      })
      .strict(),
    settings: componentSettingsSchema,
  })
  .strict();
export const downloadsSectionSchema = z
  .object({
    id: itemId,
    type: z.literal("downloads"),
    version: z.literal(1),
    is_visible: z.boolean(),
    data: z
      .object({
        variant: z.enum(["list", "cards"]),
        title: z.string().max(255).nullable().optional(),
        description: z.string().max(2000).nullable().optional(),
        items: z
          .array(
            z
              .object({
                id: itemId,
                media_id: identifier,
                label: z.string().min(1).max(255),
                description: z.string().max(1000).nullable().optional(),
              })
              .strict(),
          )
          .min(1)
          .max(50),
      })
      .strict(),
    settings: componentSettingsSchema,
  })
  .strict();
export const faqSectionSchema = z
  .object({
    id: itemId,
    type: z.literal("faq"),
    version: z.literal(1),
    is_visible: z.boolean(),
    data: z
      .object({
        variant: z.enum(["accordion", "stacked"]),
        title: z.string().max(255).nullable().optional(),
        description: z.string().max(2000).nullable().optional(),
        items: z
          .array(
            z
              .object({
                id: itemId,
                question: z.string().min(1).max(500),
                answer: z.string().min(1).max(100000),
              })
              .strict(),
          )
          .min(1)
          .max(50),
      })
      .strict(),
    settings: componentSettingsSchema,
  })
  .strict();
export const ctaSectionSchema = z
  .object({
    id: itemId,
    type: z.literal("cta"),
    version: z.literal(1),
    is_visible: z.boolean(),
    data: z
      .object({
        variant: z.enum(["banner", "centered", "split"]),
        title: z.string().min(1).max(255),
        description: z.string().max(2000).nullable().optional(),
        primary_action: actionSchema,
        secondary_action: actionSchema.nullable().optional(),
      })
      .strict(),
    settings: componentSettingsSchema,
  })
  .strict();

export const pageSectionSchema = z.union([
  heroSectionSchema,
  richContentSectionSchema,
  imageSectionSchema,
  imageTextSectionSchema,
  videoSectionSchema,
  audioSectionSchema,
  gallerySectionSchema,
  cardsSectionSchema,
  statisticsSectionSchema,
  downloadsSectionSchema,
  faqSectionSchema,
  ctaSectionSchema,
]);

export const pageContentSchema = z.object({
  schema_version: z.literal(1),
  sections: z.array(pageSectionSchema),
});

const pageRevisionSchema = z.object({
  id: identifier.optional(),
  version: z.number().int().positive(),
  title: z.string(),
  schema_version: z.literal(1),
  content: pageContentSchema,
  seo: seoData,
  created_at: z.string().nullable(),
  published_at: z.string().nullable().optional(),
});

const laravelPageListItemSchema = z.object({
  id: identifier,
  parent_id: identifier.nullable(),
  title: z.string(),
  slug: z.string(),
  path: z.string(),
  status: z.enum(pageStatuses),
  has_unpublished_changes: z.boolean(),
  published_at: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  parent: pageParentSchema.nullable().optional(),
});

export const pageListItemSchema = laravelPageListItemSchema.extend({
  public_url: absoluteHttpUrl,
});

const pageDetailFields = {
  draft: pageRevisionSchema,
  published: pageRevisionSchema.nullable(),
  media: z.record(z.string(), pageMediaSchema),
};

const laravelPageDetailSchema =
  laravelPageListItemSchema.extend(pageDetailFields);
export const pageDetailSchema = pageListItemSchema.extend(pageDetailFields);

export const laravelPageListSchema = z.object({
  data: z.array(laravelPageListItemSchema),
  links: z.object({
    first: z.string().nullable(),
    last: z.string().nullable(),
    prev: z.string().nullable(),
    next: z.string().nullable(),
  }),
  meta: z
    .object({
      current_page: z.number().int().positive(),
      last_page: z.number().int().positive(),
      per_page: z.number().int().positive(),
      total: z.number().int().nonnegative(),
    })
    .passthrough(),
});
export const pageListSchema = laravelPageListSchema.extend({
  data: z.array(pageListItemSchema),
});

export const laravelPageDetailResponseSchema = z.object({
  data: laravelPageDetailSchema,
});
export const pageDetailResponseSchema = z.object({ data: pageDetailSchema });
export const pageMediaResponseSchema = z.object({ data: pageMediaSchema });
export const laravelPagePreviewResponseSchema = z.object({
  data: z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    expires_at: z.string(),
    preview_url: z.string().regex(/^\/pages-preview\/[a-f0-9]{64}$/),
  }),
});
export const pagePreviewResponseSchema = z.object({
  data: z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    expires_at: z.string(),
    preview_url: absoluteHttpUrl,
  }),
});
export const pageRevisionSummarySchema = z.object({
  id: identifier,
  version: z.number().int().positive(),
  title: z.string(),
  created_at: z.string().nullable(),
  published_at: z.string().nullable(),
  is_current_draft: z.boolean(),
  is_current_published: z.boolean(),
  was_published: z.boolean(),
});
export const pageRevisionListSchema = z.object({
  data: z.array(pageRevisionSummarySchema),
  links: z.object({
    first: z.string().nullable(),
    last: z.string().nullable(),
    prev: z.string().nullable(),
    next: z.string().nullable(),
  }),
  meta: z
    .object({
      current_page: z.number(),
      last_page: z.number(),
      per_page: z.number(),
      total: z.number(),
    })
    .passthrough(),
});
export const pageRevisionDetailResponseSchema = z.object({
  data: pageRevisionSummarySchema.extend({
    schema_version: z.literal(1),
    content: pageContentSchema,
    seo: seoData,
    media: z.record(z.string(), pageMediaSchema),
  }),
});

export const pageListQuerySchema = z.object({
  search: z.string().trim().max(255).optional(),
  status: z.enum(pageStatuses).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

export const createPageInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(255),
  parent_id: identifier.nullable().optional(),
});

export const savePageDraftInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
  content: pageContentSchema,
  seo_data: seoData,
  slug: z.string().trim().min(1).max(255).optional(),
  parent_id: identifier.nullable().optional(),
});

export type PageListItem = z.infer<typeof pageListItemSchema>;
export type PageDetail = z.infer<typeof pageDetailSchema>;
export type PageList = z.infer<typeof pageListSchema>;
export type LaravelPageDetailResponse = z.infer<
  typeof laravelPageDetailResponseSchema
>;
export type LaravelPageList = z.infer<typeof laravelPageListSchema>;
export type LaravelPagePreviewResponse = z.infer<
  typeof laravelPagePreviewResponseSchema
>;
export type PageMedia = z.infer<typeof pageMediaSchema>;
export type HeroSection = z.infer<typeof heroSectionSchema>;
export type RichContentSection = z.infer<typeof richContentSectionSchema>;
export type ImageSection = z.infer<typeof imageSectionSchema>;
export type ImageTextSection = z.infer<typeof imageTextSectionSchema>;
export type PageSection = z.infer<typeof pageSectionSchema>;
export type VideoSection = z.infer<typeof videoSectionSchema>;
export type AudioSection = z.infer<typeof audioSectionSchema>;
export type GallerySection = z.infer<typeof gallerySectionSchema>;
export type CardsSection = z.infer<typeof cardsSectionSchema>;
export type StatisticsSection = z.infer<typeof statisticsSectionSchema>;
export type DownloadsSection = z.infer<typeof downloadsSectionSchema>;
export type FaqSection = z.infer<typeof faqSectionSchema>;
export type CtaSection = z.infer<typeof ctaSectionSchema>;
export type PageContent = z.infer<typeof pageContentSchema>;
export type CreatePageInput = z.infer<typeof createPageInputSchema>;
export type SavePageDraftInput = z.infer<typeof savePageDraftInputSchema>;
export type PagePreview = z.infer<typeof pagePreviewResponseSchema>["data"];
export type PageRevisionSummary = z.infer<typeof pageRevisionSummarySchema>;
export type PageRevisionDetail = z.infer<
  typeof pageRevisionDetailResponseSchema
>["data"];
export type PageRevisionList = z.infer<typeof pageRevisionListSchema>;

export const pageStatusLabels: Record<PageStatus, string> = {
  draft: "مسودة",
  published: "منشورة",
  archived: "مؤرشفة",
};
