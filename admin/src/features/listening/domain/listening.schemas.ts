import { z } from "zod";

import {
  listeningAudioSourceTypes,
  listeningBookSourceTypes,
  listeningVisualVariants,
} from "./listening.contracts";

const identifier = z.union([z.string(), z.number()]).transform(String);
const requiredText = z.string().trim().min(1);
const optionalText = z.preprocess(
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

export const listeningSeriesSummarySchema = z
  .object({
    id: identifier,
    slug: optionalText,
    title: requiredText,
    short_title: requiredText,
  })
  .passthrough();

export const listeningSeriesSchema = listeningSeriesSummarySchema
  .extend({
    category: requiredText,
    description: requiredText,
    period_label: requiredText,
    visual_variant: z.enum(listeningVisualVariants).nullable(),
    book_source_type: z.enum(listeningBookSourceTypes).nullable(),
    book_file_path: optionalText,
    book_file_url: optionalText.optional(),
    book_source_link: optionalText,
    book_url: optionalText.optional(),
    book_download_allowed: booleanValue,
    is_published: booleanValue,
    published_at: optionalText,
    sessions_count: z.coerce.number().int().nonnegative().default(0),
    published_sessions_count: z.coerce.number().int().nonnegative().default(0),
    created_at: optionalText.optional(),
    updated_at: optionalText.optional(),
  })
  .passthrough();

export const listeningSessionSchema = z
  .object({
    id: identifier,
    listening_series_id: identifier,
    series: listeningSeriesSummarySchema.nullable().optional(),
    slug: optionalText,
    sequence_number: z.coerce.number().int().positive(),
    title: requiredText,
    date_label: requiredText,
    duration_minutes: z.coerce.number().int().positive(),
    description: requiredText,
    audio_source_type: z.enum(listeningAudioSourceTypes).nullable(),
    audio_file_path: optionalText,
    audio_file_url: optionalText.optional(),
    audio_source_link: optionalText,
    audio_url: optionalText.optional(),
    audio_download_allowed: booleanValue,
    is_published: booleanValue,
    published_at: optionalText,
    created_at: optionalText.optional(),
    updated_at: optionalText.optional(),
  })
  .passthrough();

const seriesStatsSchema = z
  .object({
    total_series: z.coerce.number().int().nonnegative(),
    published_series: z.coerce.number().int().nonnegative(),
    draft_series: z.coerce.number().int().nonnegative(),
  })
  .partial();

const sessionStatsSchema = z
  .object({
    total_sessions: z.coerce.number().int().nonnegative(),
    published_sessions: z.coerce.number().int().nonnegative(),
    draft_sessions: z.coerce.number().int().nonnegative(),
  })
  .partial();

const seriesFiltersSchema = z
  .object({
    categories: z.array(z.string()).default([]),
    visual_variants: z.array(z.enum(listeningVisualVariants)).default([]),
  })
  .partial();
const sessionFiltersSchema = z
  .object({ series: z.array(listeningSeriesSummarySchema).default([]) })
  .partial();

function paginationShape<T extends z.ZodType>(item: T) {
  return z.object({
    data: z.array(item),
    current_page: z.coerce.number().int().positive(),
    last_page: z.coerce.number().int().positive(),
    per_page: z.coerce.number().int().positive(),
    total: z.coerce.number().int().nonnegative(),
  });
}

const rawSeriesPageSchema = paginationShape(listeningSeriesSchema)
  .extend({
    filter_options: seriesFiltersSchema.optional(),
    stats: seriesStatsSchema.optional(),
  })
  .passthrough()
  .transform((page) => ({
    ...page,
    filter_options: {
      categories: page.filter_options?.categories ?? [],
      visual_variants: page.filter_options?.visual_variants ?? [],
    },
    stats: {
      total: page.stats?.total_series ?? page.total,
      published: page.stats?.published_series ?? 0,
      drafts: page.stats?.draft_series ?? 0,
    },
  }));

const resourceSeriesPageSchema = z
  .object({
    data: z.array(listeningSeriesSchema),
    meta: paginationShape(listeningSeriesSchema).omit({ data: true }),
    filter_options: seriesFiltersSchema.optional(),
    stats: seriesStatsSchema.optional(),
  })
  .passthrough()
  .transform(({ data, meta, filter_options, stats }) => ({
    data,
    ...meta,
    filter_options: {
      categories: filter_options?.categories ?? [],
      visual_variants: filter_options?.visual_variants ?? [],
    },
    stats: {
      total: stats?.total_series ?? meta.total,
      published: stats?.published_series ?? 0,
      drafts: stats?.draft_series ?? 0,
    },
  }));

const rawSessionPageSchema = paginationShape(listeningSessionSchema)
  .extend({
    filter_options: sessionFiltersSchema.optional(),
    stats: sessionStatsSchema.optional(),
  })
  .passthrough()
  .transform((page) => ({
    ...page,
    filter_options: { series: page.filter_options?.series ?? [] },
    stats: {
      total: page.stats?.total_sessions ?? page.total,
      published: page.stats?.published_sessions ?? 0,
      drafts: page.stats?.draft_sessions ?? 0,
    },
  }));

const resourceSessionPageSchema = z
  .object({
    data: z.array(listeningSessionSchema),
    meta: paginationShape(listeningSessionSchema).omit({ data: true }),
    filter_options: sessionFiltersSchema.optional(),
    stats: sessionStatsSchema.optional(),
  })
  .passthrough()
  .transform(({ data, meta, filter_options, stats }) => ({
    data,
    ...meta,
    filter_options: { series: filter_options?.series ?? [] },
    stats: {
      total: stats?.total_sessions ?? meta.total,
      published: stats?.published_sessions ?? 0,
      drafts: stats?.draft_sessions ?? 0,
    },
  }));

export const listeningSeriesPageSchema = z.union([
  resourceSeriesPageSchema,
  rawSeriesPageSchema,
]);
export const listeningSessionPageSchema = z.union([
  resourceSessionPageSchema,
  rawSessionPageSchema,
]);

const listeningSeriesWithSessionsSchema = listeningSeriesSchema.extend({
  sessions: z.array(listeningSessionSchema).optional(),
});

export const listeningSeriesDetailSchema = z.union([
  z
    .object({ data: listeningSeriesWithSessionsSchema })
    .passthrough()
    .transform(({ data }) => data),
  z
    .object({ series: listeningSeriesWithSessionsSchema })
    .passthrough()
    .transform(({ series }) => series),
  listeningSeriesWithSessionsSchema,
]);
export const listeningSessionDetailSchema = z.union([
  z
    .object({ data: listeningSessionSchema })
    .passthrough()
    .transform(({ data }) => data),
  z
    .object({ session: listeningSessionSchema })
    .passthrough()
    .transform(({ session }) => session),
  listeningSessionSchema,
]);

const mutationMessage = z.string().default("تم الحفظ بنجاح.");
export const listeningSeriesMutationSchema = z.union([
  z
    .object({ message: mutationMessage, data: listeningSeriesSchema })
    .passthrough(),
  z
    .object({ message: mutationMessage, series: listeningSeriesSchema })
    .passthrough()
    .transform(({ message, series }) => ({ message, data: series })),
  z
    .object({ data: listeningSeriesSchema })
    .passthrough()
    .transform(({ data }) => ({ message: "تم الحفظ بنجاح.", data })),
]);
export const listeningSessionMutationSchema = z.union([
  z
    .object({ message: mutationMessage, data: listeningSessionSchema })
    .passthrough(),
  z
    .object({ message: mutationMessage, session: listeningSessionSchema })
    .passthrough()
    .transform(({ message, session }) => ({ message, data: session })),
  z
    .object({ data: listeningSessionSchema })
    .passthrough()
    .transform(({ data }) => ({ message: "تم الحفظ بنجاح.", data })),
]);
export const listeningDeleteSchema = z
  .object({ message: z.string().default("تم الحذف بنجاح.") })
  .passthrough();

const queryText = z.string().trim().min(1).max(255).optional();
export const listeningSeriesQuerySchema = z.strictObject({
  search: queryText,
  category: queryText,
  is_published: z.enum(["0", "1"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});
export const listeningSessionQuerySchema = z.strictObject({
  search: queryText,
  series_id: queryText,
  is_published: z.enum(["0", "1"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});
