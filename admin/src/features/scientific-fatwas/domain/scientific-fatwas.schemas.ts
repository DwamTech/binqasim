import { z } from "zod";

const identifier = z.union([z.string(), z.number()]).transform(String);
const nullableIdentifier = z.preprocess(
  (value) =>
    value === undefined || value === null || value === "" ? null : value,
  identifier.nullable(),
);
const requiredText = z.string().trim().min(1);
const nullableText = z.preprocess(
  (value) => (value === undefined || value === null ? null : value),
  z.string().nullable(),
);
const booleanValue = z.preprocess((value) => {
  if (value === true || value === 1 || value === "1" || value === "true")
    return true;
  if (value === false || value === 0 || value === "0" || value === "false")
    return false;
  return value;
}, z.boolean());
const textArray = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Legacy comma/newline values are normalized below.
  }
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(z.string()));

const status = z.enum(["published", "scheduled", "draft"]);

export const scientificFatwaCategoryOptionSchema = z.object({
  id: identifier,
  name: requiredText,
  slug: z.string().default(""),
});

export const scientificFatwaCategorySchema = scientificFatwaCategoryOptionSchema
  .extend({
    is_active: booleanValue.default(true),
    sort_order: z.coerce.number().int().min(0).default(0),
    items_count: z.coerce.number().int().nonnegative().optional(),
    inbox_questions_count: z.coerce.number().int().nonnegative().optional(),
  })
  .passthrough();

export const scientificFatwaItemSchema = z
  .object({
    id: identifier,
    slug: requiredText,
    title: requiredText,
    category: requiredText,
    category_id: nullableIdentifier.default(null),
    category_option: scientificFatwaCategoryOptionSchema
      .nullable()
      .default(null),
    question: requiredText,
    answer: requiredText,
    date_label: requiredText,
    sources: textArray,
    keywords: textArray,
    is_featured: booleanValue,
    is_listed: booleanValue.default(true),
    is_published: booleanValue,
    source_fatwa_id: nullableIdentifier.default(null),
    managed_by_inbox: booleanValue.default(false),
    status,
    published_at: nullableText,
    public_url: nullableText.default(null),
    created_at: nullableText.optional(),
    updated_at: nullableText.optional(),
  })
  .passthrough();

const pageMeta = z.object({
  current_page: z.coerce.number().int().positive(),
  last_page: z.coerce.number().int().positive(),
  per_page: z.coerce.number().int().positive(),
  total: z.coerce.number().int().nonnegative(),
});

const filterOptions = z
  .object({
    categories: z.array(z.string()).default([]),
    category_options: z.array(scientificFatwaCategoryOptionSchema).default([]),
    statuses: z.array(status).default([]),
  })
  .default({ categories: [], category_options: [], statuses: [] });

const stats = z
  .object({
    total: z.coerce.number().int().nonnegative(),
    published: z.coerce.number().int().nonnegative(),
    scheduled: z.coerce.number().int().nonnegative(),
    drafts: z.coerce.number().int().nonnegative(),
  })
  .default({ total: 0, published: 0, scheduled: 0, drafts: 0 });

export const scientificFatwaPageSchema = z
  .object({
    data: z.array(scientificFatwaItemSchema),
    meta: pageMeta,
    filter_options: filterOptions,
    stats,
  })
  .passthrough()
  .transform(({ data, meta, filter_options, stats: pageStats }) => ({
    data,
    ...meta,
    filter_options,
    stats: pageStats,
  }));

export const scientificFatwaDetailSchema = z.union([
  z
    .object({ data: scientificFatwaItemSchema })
    .passthrough()
    .transform(({ data }) => data),
  scientificFatwaItemSchema,
]);

export const scientificFatwaMutationSchema = z
  .object({ message: z.string(), data: scientificFatwaItemSchema })
  .passthrough();

export const scientificFatwaDeleteSchema = z
  .object({ message: z.string() })
  .passthrough();

export const scientificFatwaCategoriesResponseSchema = z
  .object({ data: z.array(scientificFatwaCategorySchema) })
  .passthrough();

export const scientificFatwaCategoryMutationSchema = z
  .object({
    message: z.string().default("تم حفظ التصنيف العلمي."),
    data: scientificFatwaCategorySchema,
  })
  .passthrough();

const queryText = z.string().trim().min(1).max(255).optional();
export const scientificFatwaQuerySchema = z.strictObject({
  search: queryText,
  category: queryText,
  status: status.optional(),
  is_featured: z.enum(["0", "1"]).optional(),
  is_listed: z.enum(["0", "1"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});
