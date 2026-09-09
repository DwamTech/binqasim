import { z } from "zod";

export const galleryMediaTypeSchema = z.enum(["image", "video"]);
export const galleryMediaItemSchema = z
  .object({
    id: z.number().int().positive(),
    type: galleryMediaTypeSchema,
    path: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    original_name: z.string(),
    mime_type: z.string(),
    size: z.number().nonnegative(),
    uploaded_by: z.number().int().nullable().optional(),
  })
  .passthrough();

export const galleryMediaPaginatorSchema = z
  .object({
    current_page: z.number().int().positive(),
    data: z.array(galleryMediaItemSchema),
    per_page: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })
  .passthrough();

export const galleryMediaUploadSchema = z
  .object({
    message: z.string(),
    items: z.array(galleryMediaItemSchema).optional(),
  })
  .passthrough();
