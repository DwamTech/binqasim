import { z } from "zod";

export const visualIdentifierSchema = z.union([z.string(), z.number()]);
export const visualTypeSchema = z.enum(["upload", "link"]);

export const visualSectionSchema = z
  .object({
    id: visualIdentifierSchema,
    name: z.string(),
    slug: z.string().optional(),
    module: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
    user_id: visualIdentifierSchema.optional(),
  })
  .passthrough();

export const visualSchema = z
  .object({
    id: visualIdentifierSchema,
    title: z.string(),
    type: visualTypeSchema,
    description: z.string().nullable().optional(),
    file_path: z.string().nullable().optional(),
    file: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    section: visualSectionSchema.nullable().optional(),
    keywords: z.string().nullable().optional(),
    rating: z.number().nullable().optional(),
    views_count: z.number().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .passthrough();

export const visualPaginatorSchema = z
  .object({
    current_page: z.number().int().positive(),
    data: z.array(visualSchema),
    per_page: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })
  .passthrough();

export const visualMutationSchema = z
  .object({
    message: z.string(),
    visual: visualSchema.optional(),
  })
  .passthrough();
