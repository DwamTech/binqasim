import { z } from "zod";

import { tourRequestStatuses } from "./tour-guides.contracts";

const identifier = z.union([z.string(), z.number()]).transform(String);
const nullableText = z.string().nullable().optional().default(null);
const count = z.coerce.number().int().nonnegative();

export const tourGuideSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    slug: z.string().trim().min(1),
    name: z.string().trim().min(1),
    title: z.string().trim().min(1),
    bio: nullableText,
    experience_years: count,
    languages: z.array(z.string().trim().min(1)).default([]),
    tour_routes: z.array(z.string().trim().min(1)).default([]),
    photo_url: nullableText,
    is_active: z.boolean(),
    is_archived: z.boolean(),
    display_order: count,
    license_number: nullableText,
    phone: nullableText,
    email: nullableText,
    created_at: nullableText,
    updated_at: nullableText,
  })
  .passthrough();

const historyActorSchema = z
  .object({ id: identifier, name: z.string().trim().min(1) })
  .passthrough();

const tourRequestHistorySchema = z
  .object({
    id: identifier,
    from_status: z.enum(tourRequestStatuses).nullable().optional(),
    old_status: z.enum(tourRequestStatuses).nullable().optional(),
    to_status: z.enum(tourRequestStatuses).nullable().optional(),
    new_status: z.enum(tourRequestStatuses).nullable().optional(),
    status: z.enum(tourRequestStatuses).nullable().optional(),
    admin_note: nullableText,
    note: nullableText,
    changed_by: historyActorSchema.nullable().optional(),
    admin: historyActorSchema.nullable().optional(),
    created_at: nullableText,
  })
  .passthrough()
  .transform((entry) => ({
    id: entry.id,
    fromStatus: entry.from_status ?? entry.old_status ?? null,
    toStatus: entry.to_status ?? entry.new_status ?? entry.status ?? null,
    note: entry.admin_note ?? entry.note ?? null,
    actor: entry.changed_by ?? entry.admin ?? null,
    createdAt: entry.created_at,
  }));

export const tourRequestSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    reference: z.string().trim().min(1),
    guide: tourGuideSchema,
    full_name: z.string().trim().min(1),
    phone: z.string().trim().min(1),
    email: z.string().trim().min(1),
    tour_route: z.string().trim().min(1),
    tour_goal: z.string().trim().min(1),
    visitor_type: z.string().trim().min(1),
    preferred_date: nullableText,
    preferred_time: nullableText,
    participants_count: z.coerce.number().int().positive(),
    status: z.enum(tourRequestStatuses),
    admin_note: nullableText,
    privacy_accepted_at: nullableText,
    status_history: z.array(tourRequestHistorySchema).default([]),
    created_at: nullableText,
    updated_at: nullableText,
  })
  .passthrough();

const paginationMetaSchema = z
  .object({
    current_page: z.coerce.number().int().positive(),
    last_page: z.coerce.number().int().positive(),
    per_page: z.coerce.number().int().positive(),
    total: count,
    from: z.coerce
      .number()
      .int()
      .positive()
      .nullable()
      .optional()
      .default(null),
    to: z.coerce.number().int().positive().nullable().optional().default(null),
  })
  .passthrough();

const linksSchema = z.record(z.string(), z.unknown()).default({});

export const tourGuidesPageSchema = z
  .object({
    data: z.array(tourGuideSchema),
    links: linksSchema,
    meta: paginationMetaSchema,
  })
  .passthrough();

export const tourRequestsPageSchema = z
  .object({
    data: z.array(tourRequestSchema),
    links: linksSchema,
    meta: paginationMetaSchema,
  })
  .passthrough();

export const tourGuideResourceSchema = z
  .object({ data: tourGuideSchema })
  .passthrough()
  .transform(({ data }) => data);

export const tourRequestResourceSchema = z
  .object({ data: tourRequestSchema })
  .passthrough()
  .transform(({ data }) => data);

export const tourGuidesSummarySchema = z
  .object({
    data: z
      .object({
        guides_total: count.default(0),
        guides_active: count.default(0),
        guides_inactive: count.default(0),
      })
      .passthrough(),
  })
  .passthrough()
  .transform(({ data }) => data);

export const tourRequestsSummarySchema = z
  .object({
    data: z
      .object({
        requests_total: count.default(0),
        new: count.default(0),
        in_progress: count.default(0),
        completed: count.default(0),
      })
      .passthrough(),
  })
  .passthrough()
  .transform(({ data }) => data);

export const tourGuidesQuerySchema = z.strictObject({
  search: z.string().trim().min(1).max(255).optional(),
  is_active: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(5).max(100).default(15),
});

export const tourRequestsQuerySchema = z.strictObject({
  search: z.string().trim().min(1).max(255).optional(),
  status: z.enum(tourRequestStatuses).optional(),
  guide_id: z.coerce.number().int().positive().optional(),
  date_from: z.iso.date().optional(),
  date_to: z.iso.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(5).max(100).default(15),
});

export const tourRequestStatusUpdateSchema = z.strictObject({
  status: z.enum(tourRequestStatuses),
  admin_note: z.string().trim().max(5000).nullable().optional(),
});

export const tourGuideScalarSchema = z.strictObject({
  name: z.string().trim().min(2).max(180),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "الرابط المختصر غير صالح."),
  title: z.string().trim().min(2).max(255),
  bio: z.string().trim().max(5000),
  experience_years: z.coerce.number().int().min(0).max(80),
  languages: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
  tour_routes: z.array(z.string().trim().min(1).max(255)).min(1).max(100),
  is_active: z.enum(["1", "0"]),
  display_order: z.coerce.number().int().min(0).max(100000),
  license_number: z.string().trim().max(100),
  phone: z.string().trim().max(32),
  email: z.union([z.literal(""), z.email()]),
});

export const tourGuideDeleteSchema = z
  .object({ message: z.string().optional() })
  .passthrough();
