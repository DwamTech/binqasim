import { z } from "zod";
import {
  ARABIC_DISPLAY_LOCALE,
  formatArabicFileSize,
  formatArabicNumber,
} from "@/shared/lib/arabic-format";

export const articleStatuses = [
  "draft",
  "scheduled",
  "published",
  "archived",
] as const;
export type ArticleStatus = (typeof articleStatuses)[number];

export const articleStatusLabels: Record<ArticleStatus, string> = {
  draft: "مسودة",
  scheduled: "مجدول",
  published: "منشور",
  archived: "مؤرشف",
};

const identifierSchema = z.union([z.number(), z.string()]).transform(String);

export const articleSectionSchema = z.object({
  id: identifierSchema,
  name: z.string(),
  slug: z.string(),
  module: z.string().nullable(),
  is_active: z.boolean(),
});

export const articleAuthorSchema = z.object({
  id: identifierSchema,
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});

export const articleMediaSchema = z.object({
  id: identifierSchema,
  type: z.enum(["gallery_image", "audio", "file", "video"]),
  original_name: z.string().nullable().optional(),
  mime_type: z.string().nullable().optional(),
  size: z.number().int().nonnegative().nullable().optional(),
  sort_order: z.number().int().nullable().optional(),
  url: z.string().url(),
});

export const articleSchema = z.object({
  id: identifierSchema,
  user_id: identifierSchema,
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable().optional(),
  content: z.string(),
  author_name: z.string().nullable().optional(),
  status: z.enum(articleStatuses),
  section: articleSectionSchema.nullable().optional(),
  author: articleAuthorSchema.nullable().optional(),
  featured_image: z.string().url().nullable().optional(),
  media: z.array(articleMediaSchema).optional().default([]),
  gregorian_date: z.string().nullable().optional(),
  hijri_date: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  references: z.string().nullable().optional(),
  keywords: z.string().nullable().optional(),
  published_at: z.string().nullable().optional(),
  views_count: z.number().int().nonnegative(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const articleDetailResponseSchema = z.object({ data: articleSchema });
export const articlePageSchema = z.object({
  data: z.array(articleSchema),
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
      from: z.number().int().nullable().optional(),
      to: z.number().int().nullable().optional(),
    })
    .passthrough(),
});
export const articleMutationResponseSchema = z.object({
  message: z.string(),
  article: articleSchema,
});
export const articleDeleteResponseSchema = z.object({ message: z.string() });
export const articleToggleResponseSchema = z.object({
  message: z.string(),
  status: z.enum(articleStatuses),
  article: z.object({ id: identifierSchema }).passthrough(),
});
export const articleAuthorsResponseSchema = z.object({
  data: z.array(articleAuthorSchema),
});
export const articleSectionsResponseSchema = z.array(articleSectionSchema);
export const articleCatalogsSchema = z.object({
  sections: z.array(articleSectionSchema),
  authors: z.array(articleAuthorSchema),
});

export const articleQuerySchema = z.strictObject({
  search: z.string().trim().max(255).optional(),
  section_id: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional(),
  status: z.enum(articleStatuses).optional(),
  author: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

export type Article = z.infer<typeof articleSchema>;
export type ArticleMedia = z.infer<typeof articleMediaSchema>;
export type ArticleSection = z.infer<typeof articleSectionSchema>;
export type ArticleAuthor = z.infer<typeof articleAuthorSchema>;
export type ArticlePage = z.infer<typeof articlePageSchema>;
export type ArticleCatalogs = z.infer<typeof articleCatalogsSchema>;
export type ArticleQuery = z.infer<typeof articleQuerySchema>;

export type ArticleFormValues = {
  title: string;
  slug: string;
  content: string;
  status: ArticleStatus;
  section_id: string;
  excerpt: string;
  author_name: string;
  published_at: string;
  duration: string;
  location: string;
  references: string;
  keywords: string;
};

export type ArticleFormFiles = {
  featuredImage?: File | undefined;
  galleryImages: File[];
  audioFiles: File[];
  documents: File[];
  videos: File[];
};

export const emptyArticleForm: ArticleFormValues = {
  title: "",
  slug: "",
  content: "",
  status: "draft",
  section_id: "",
  excerpt: "",
  author_name: "",
  published_at: "",
  duration: "",
  location: "",
  references: "",
  keywords: "",
};

export function articleToFormValues(article: Article): ArticleFormValues {
  return {
    title: article.title,
    slug: article.slug,
    content: article.content,
    status: article.status,
    section_id: article.section?.id ?? "",
    excerpt: article.excerpt ?? "",
    author_name: article.author_name ?? "",
    published_at: article.published_at?.slice(0, 16) ?? "",
    duration: article.duration ?? "",
    location: article.location ?? "",
    references: article.references ?? "",
    keywords: article.keywords ?? "",
  };
}

export function formatArticleDate(value?: string | null): string {
  if (!value) return "غير محدد";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(ARABIC_DISPLAY_LOCALE, {
        dateStyle: "medium",
        timeZone: "Africa/Cairo",
      }).format(date);
}

export function formatFileSize(bytes?: number | null): string {
  if (bytes === undefined || bytes === null) return "حجم غير متاح";
  if (bytes < 1024) return `${formatArabicNumber(bytes)} بايت`;
  return formatArabicFileSize(bytes, bytes >= 1024 * 1024 ? 1 : 2);
}
