import { z } from "zod";

import {
  dissertationPublicationStatuses,
  dissertationSourceTypes,
} from "./dissertations.contracts";

const identifierSchema = z.union([z.string(), z.number()]).transform(String);
const requiredText = z.string().trim().min(1);
const textOrEmpty = z.preprocess(
  (value) => (value === undefined || value === null ? "" : value),
  z.string(),
);
const nullableText = z.preprocess(
  (value) => (value === undefined || value === null ? null : value),
  z.string().nullable(),
);
const booleanSchema = z.preprocess((value) => {
  if (value === 1 || value === "1" || value === true || value === "true")
    return true;
  if (value === 0 || value === "0" || value === false || value === "false")
    return false;
  return value;
}, z.boolean());
const keywordsSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Comma-separated legacy values are normalized below.
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(z.string()));

export const dissertationSchema = z
  .object({
    id: identifierSchema,
    slug: requiredText,
    title: requiredText,
    researcher_name: requiredText,
    university: textOrEmpty,
    college: textOrEmpty,
    year: textOrEmpty.or(z.number().transform(String)),
    specialization: textOrEmpty,
    participation_type: textOrEmpty,
    degree: textOrEmpty,
    abstract: nullableText,
    participation_description: nullableText,
    source_type: z.enum(dissertationSourceTypes).nullable(),
    file_path: nullableText,
    has_file: booleanSchema.optional().default(false),
    file_url: nullableText.optional(),
    source_link: nullableText,
    keywords: keywordsSchema,
    is_published: booleanSchema,
    status: z.enum(dissertationPublicationStatuses).optional(),
    published_at: nullableText,
    created_at: nullableText.optional(),
    updated_at: nullableText.optional(),
  })
  .passthrough();

const dissertationFilterOptionsSchema = z
  .object({
    years: z
      .array(z.union([z.string(), z.number()]).transform(String))
      .default([]),
    universities: z.array(z.string()).default([]),
    specializations: z.array(z.string()).default([]),
    participation_types: z.array(z.string()).default([]),
    degrees: z.array(z.string()).default([]),
  })
  .default({
    years: [],
    universities: [],
    specializations: [],
    participation_types: [],
    degrees: [],
  });

const dissertationStatsSchema = z
  .object({
    total_dissertations: z.coerce.number().int().nonnegative().default(0),
    published_dissertations: z.coerce.number().int().nonnegative().default(0),
    draft_dissertations: z.coerce.number().int().nonnegative().default(0),
    scheduled_dissertations: z.coerce.number().int().nonnegative().default(0),
  })
  .default({
    total_dissertations: 0,
    published_dissertations: 0,
    draft_dissertations: 0,
    scheduled_dissertations: 0,
  });

const resourcePageSchema = z
  .object({
    data: z.array(dissertationSchema),
    meta: z
      .object({
        current_page: z.coerce.number().int().positive(),
        last_page: z.coerce.number().int().positive(),
        per_page: z.coerce.number().int().positive(),
        total: z.coerce.number().int().nonnegative(),
      })
      .passthrough(),
    filter_options: dissertationFilterOptionsSchema,
    stats: dissertationStatsSchema,
  })
  .passthrough()
  .transform(({ data, meta, filter_options, stats }) => ({
    data,
    current_page: meta.current_page,
    last_page: meta.last_page,
    per_page: meta.per_page,
    total: meta.total,
    filter_options,
    stats,
  }));

const rawPageSchema = z
  .object({
    data: z.array(dissertationSchema),
    current_page: z.coerce.number().int().positive(),
    last_page: z.coerce.number().int().positive(),
    per_page: z.coerce.number().int().positive(),
    total: z.coerce.number().int().nonnegative(),
    filter_options: dissertationFilterOptionsSchema.optional(),
    stats: dissertationStatsSchema.optional(),
  })
  .passthrough()
  .transform(
    ({
      data,
      current_page,
      last_page,
      per_page,
      total,
      filter_options,
      stats,
    }) => ({
      data,
      current_page,
      last_page,
      per_page,
      total,
      filter_options: filter_options ?? {
        years: [],
        universities: [],
        specializations: [],
        participation_types: [],
        degrees: [],
      },
      stats: stats ?? {
        total_dissertations: total,
        published_dissertations: 0,
        draft_dissertations: 0,
        scheduled_dissertations: 0,
      },
    }),
  );

export const dissertationPageSchema = z.union([
  resourcePageSchema,
  rawPageSchema,
]);

export const dissertationDetailResponseSchema = z.union([
  z
    .object({ data: dissertationSchema })
    .passthrough()
    .transform(({ data }) => data),
  z
    .object({ dissertation: dissertationSchema })
    .passthrough()
    .transform(({ dissertation }) => dissertation),
  dissertationSchema,
]);

export const dissertationMutationResponseSchema = z.union([
  z.object({ message: z.string(), data: dissertationSchema }).passthrough(),
  z
    .object({ message: z.string(), dissertation: dissertationSchema })
    .passthrough()
    .transform(({ message, dissertation }) => ({
      message,
      data: dissertation,
    })),
]);

export const dissertationDeleteResponseSchema = z
  .object({ message: z.string() })
  .passthrough();

const queryText = z.string().trim().min(1).max(255).optional();
export const dissertationQuerySchema = z.strictObject({
  search: queryText,
  year: queryText,
  university: queryText,
  specialization: queryText,
  participation_type: queryText,
  degree: queryText,
  is_published: z.enum(["0", "1"]).optional(),
  status: z.enum(dissertationPublicationStatuses).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});
