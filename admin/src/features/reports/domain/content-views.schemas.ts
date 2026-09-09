import { z } from "zod";

export const contentViewModuleSummarySchema = z
  .object({
    key: z.enum([
      "articles",
      "scientific_library",
      "dissertations",
      "listening",
      "scientific_fatwas",
      "scientific_videos",
      "hadith_cards",
    ]),
    label: z.string(),
    items_count: z.number().int().nonnegative(),
    views_count: z.number().int().nonnegative(),
  })
  .passthrough();

export const contentViewsSummarySchema = z
  .object({
    total: z.number().int().nonnegative(),
    modules: z.array(contentViewModuleSummarySchema),
  })
  .passthrough();

export const dashboardSummaryEnvelopeSchema = z
  .object({
    data: z
      .object({
        // Optional during rolling deployments so an older shared backend does
        // not make the whole dashboard unavailable while nodes are replaced.
        content_views: contentViewsSummarySchema.optional(),
      })
      .passthrough(),
  })
  .passthrough();
