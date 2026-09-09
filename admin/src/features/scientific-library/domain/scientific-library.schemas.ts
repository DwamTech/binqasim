import { z } from "zod";

import {
  scientificLibrarySourceTypes,
  scientificLibraryStatuses,
} from "./scientific-library.contracts";

const identifierSchema = z.union([z.string(), z.number()]).transform(String);
const requiredText = z.string().trim().min(1);
const nullableText = z.preprocess(
  (value) =>
    value === undefined || value === null || value === "" ? null : value,
  z.string().nullable(),
);
const booleanSchema = z.preprocess((value) => {
  if (value === true || value === 1 || value === "1" || value === "true")
    return true;
  if (value === false || value === 0 || value === "0" || value === "false")
    return false;
  return value;
}, z.boolean());
const keywordsSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;
  try {
    const decoded: unknown = JSON.parse(value);
    if (Array.isArray(decoded)) return decoded;
  } catch {
    // Legacy comma-separated keywords are normalized below.
  }
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}, z.array(z.string()));

export const scientificLibraryItemSchema = z
  .object({
    id: identifierSchema,
    slug: requiredText,
    title: requiredText,
    short_title: nullableText,
    author_name: requiredText,
    description: requiredText,
    content_type: requiredText,
    scientific_field: requiredText,
    pages_count: z.coerce.number().int().positive(),
    edition: requiredText,
    publication_info: nullableText,
    source_type: z.enum(scientificLibrarySourceTypes),
    file_path: nullableText,
    source_link: nullableText,
    source_url: nullableText.optional().default(null),
    reader_url: nullableText.optional().default(null),
    download_url: nullableText.optional().default(null),
    admin_file_url: nullableText.optional().default(null),
    cover_path: nullableText,
    cover_url: nullableText.optional().default(null),
    keywords: keywordsSchema,
    download_allowed: booleanSchema,
    is_featured: booleanSchema,
    is_published: booleanSchema,
    published_at: nullableText,
    views_count: z.coerce.number().int().nonnegative().default(0),
    created_at: nullableText.optional().default(null),
    updated_at: nullableText.optional().default(null),
  })
  .passthrough();

const paginationLinkSchema = nullableText;

export const scientificLibraryPageSchema = z
  .object({
    data: z.array(scientificLibraryItemSchema),
    links: z
      .object({
        first: paginationLinkSchema,
        last: paginationLinkSchema,
        prev: paginationLinkSchema,
        next: paginationLinkSchema,
      })
      .passthrough(),
    meta: z
      .object({
        current_page: z.coerce.number().int().positive(),
        last_page: z.coerce.number().int().positive(),
        per_page: z.coerce.number().int().positive(),
        total: z.coerce.number().int().nonnegative(),
        from: z.coerce.number().int().positive().nullable(),
        to: z.coerce.number().int().positive().nullable(),
      })
      .passthrough(),
  })
  .passthrough();

export const scientificLibraryDetailResponseSchema = z
  .object({ data: scientificLibraryItemSchema })
  .passthrough()
  .transform(({ data }) => data);

export const scientificLibraryMutationResponseSchema = z
  .object({ message: z.string(), data: scientificLibraryItemSchema })
  .passthrough();

export const scientificLibraryDeleteResponseSchema = z
  .object({ message: z.string() })
  .passthrough();

const optionSchema = z.union([
  requiredText.transform((value) => ({ value, label: value })),
  z
    .object({ value: requiredText, label: requiredText })
    .passthrough()
    .transform(({ value, label }) => ({ value, label })),
  z
    .object({ key: requiredText, label: requiredText })
    .passthrough()
    .transform(({ key, label }) => ({ value: key, label })),
]);

export const scientificLibraryOptionsResponseSchema = z
  .object({
    data: z
      .object({
        content_types: z.array(optionSchema).default([]),
        scientific_fields: z.array(optionSchema).default([]),
        source_types: z.array(optionSchema).default([]),
        statuses: z.array(optionSchema).default([]),
      })
      .passthrough(),
  })
  .passthrough()
  .transform(({ data }) => data);

const optionalQueryText = z.string().trim().min(1).max(255).optional();
export const scientificLibraryQuerySchema = z.strictObject({
  search: optionalQueryText,
  content_type: optionalQueryText,
  scientific_field: optionalQueryText,
  status: z.enum(scientificLibraryStatuses).optional(),
  source_type: z.enum(scientificLibrarySourceTypes).optional(),
  is_featured: z.enum(["0", "1"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});
