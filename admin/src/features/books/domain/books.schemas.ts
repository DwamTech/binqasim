import { z } from "zod";
const nullableIntegerSchema = z.coerce.number().int().positive().nullable();
export const bookTypeSchema = z.enum(["single", "part"]);
export const bookSourceTypeSchema = z.enum(["file", "link", "embed"]);
export const bookCoverTypeSchema = z.enum(["auto", "upload"]);
export const adminBookSchema = z
  .object({
    id: z.number().int().positive(),
    title: z.string(),
    type: bookTypeSchema,
    description: z.string().nullable().optional(),
    source_type: bookSourceTypeSchema.nullable().optional(),
    file_path: z.string().nullable().optional(),
    source_link: z.string().nullable().optional(),
    cover_type: bookCoverTypeSchema.nullable().optional(),
    cover_path: z.string().nullable().optional(),
    keywords: z.array(z.string()).nullable().optional(),
    author_name: z.string().nullable().optional(),
    book_series_id: nullableIntegerSchema.optional(),
    section_id: nullableIntegerSchema.optional(),
    slug: z.string().nullable().optional(),
    short_title: z.string().nullable().optional(),
    pages_count: nullableIntegerSchema.optional(),
    edition: z.string().nullable().optional(),
    publication_info: z.string().nullable().optional(),
    download_allowed: z.boolean().optional(),
    is_published: z.boolean().optional(),
    published_at: z.string().nullable().optional(),
    views_count: z.number().optional(),
    rating_count: z.number().optional(),
    average_rating: z.number().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    section: z
      .object({
        id: z.coerce.number().int().positive(),
        name: z.string(),
        is_active: z.boolean().optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();
export const adminBooksPaginatorSchema = z
  .object({
    current_page: z.number().int().positive(),
    data: z.array(adminBookSchema),
    per_page: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })
  .passthrough();
export const bookSeriesSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string(),
    description: z.string().nullable().optional(),
  })
  .passthrough();
export const bookAuthorsSchema = z.array(z.string());
export const bookSeriesSummarySchema = z
  .object({ name: z.string().nullable().optional() })
  .passthrough();
export const bookSectionSummarySchema = z
  .object({ name: z.string().nullable().optional() })
  .passthrough();
export const relatedBookPartSchema = z
  .object({
    id: z.number().int().positive(),
    title: z.string(),
    cover_path: z.string().nullable(),
    cover_type: bookCoverTypeSchema,
  })
  .passthrough();
export const adminBookDetailSchema = z
  .object({
    id: z.number().int().positive(),
    title: z.string(),
    description: z.string(),
    source_type: bookSourceTypeSchema,
    file_path: z.string().nullable(),
    source_link: z.string().nullable(),
    cover_type: bookCoverTypeSchema,
    cover_path: z.string().nullable(),
    keywords: z.array(z.string()).nullable(),
    views_count: z.number(),
    rating_sum: z.union([z.string(), z.number()]),
    rating_count: z.number(),
    author_name: z.string(),
    type: bookTypeSchema,
    book_series_id: nullableIntegerSchema,
    section_id: nullableIntegerSchema,
    created_at: z.string(),
    updated_at: z.string(),
    average_rating: z.number(),
    series: bookSeriesSummarySchema.nullable(),
    section: bookSectionSummarySchema.nullable(),
    slug: z.string().nullable().optional(),
    short_title: z.string().nullable().optional(),
    pages_count: nullableIntegerSchema.optional(),
    edition: z.string().nullable().optional(),
    publication_info: z.string().nullable().optional(),
    download_allowed: z.boolean().optional(),
    is_published: z.boolean().optional(),
    published_at: z.string().nullable().optional(),
  })
  .passthrough();
export const adminBookDetailResponseSchema = z
  .object({
    book: adminBookDetailSchema,
    related_parts: z.array(relatedBookPartSchema).default([]),
  })
  .passthrough();

export const bookMutationResponseSchema = z.object({
  message: z.string(),
  data: adminBookSchema,
});

export const bookDeleteResponseSchema = z.object({
  message: z.string(),
});

export const bookSeriesMutationResponseSchema = z.object({
  message: z.string(),
  data: bookSeriesSchema,
});

export const libraryCategorySchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    is_active: z.boolean(),
    sort_order: z.number().int().nonnegative().default(0),
    parent_id: z.number().int().positive(),
    books_count: z.number().int().nonnegative().default(0),
  })
  .passthrough();

export const libraryCategoriesResponseSchema = z.object({
  data: z.array(libraryCategorySchema),
  area: z
    .object({
      id: z.number().int().positive(),
      name: z.string(),
      slug: z.string(),
    })
    .passthrough(),
});

export const libraryCategoryMutationResponseSchema = z.object({
  message: z.string(),
  data: libraryCategorySchema,
});
