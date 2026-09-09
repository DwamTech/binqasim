import { z } from "zod";

import { commentStatuses } from "./comments.contracts";

const identifier = z.union([z.string(), z.number()]).transform(String);
const nullableText = z.string().nullable();
const count = z.coerce.number().int().nonnegative();

export const commentTargetSchema = z
  .object({
    type: z.string().trim().min(1),
    label: z.string().trim().min(1),
    id: identifier,
    locator: z.string().trim().min(1),
    title: z.string().trim().min(1),
    public_path: nullableText.optional().default(null),
  })
  .passthrough();

export const contentCommentSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    body: z.string().trim().min(1),
    status: z.enum(commentStatuses),
    ip_address: z.string().trim().min(1).nullable(),
    target: commentTargetSchema,
    created_at: z.string().trim().min(1).nullable(),
    created_at_label: nullableText.optional().default(null),
    approved_at: nullableText.optional().default(null),
    approver: z
      .object({
        id: identifier,
        name: z.string().trim().min(1),
        email: z.string().email().nullable().optional().default(null),
      })
      .passthrough()
      .nullable()
      .optional()
      .default(null),
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

const summarySchema = z
  .object({
    total: count,
    pending: count,
    approved: count,
  })
  .passthrough();

export const commentsPageSchema = z
  .object({
    data: z.array(contentCommentSchema),
    meta: paginationMetaSchema,
  })
  .passthrough();

export const commentsStatsSchema = z
  .object({ data: summarySchema })
  .passthrough()
  .transform(({ data }) => data);

export const commentDetailSchema = z
  .object({ data: contentCommentSchema })
  .passthrough()
  .transform(({ data }) => data);

const optionSchema = z.union([
  z
    .string()
    .trim()
    .min(1)
    .transform((value) => ({ value, label: value })),
  z
    .object({
      value: z.string().trim().min(1),
      label: z.string().trim().min(1),
    })
    .passthrough()
    .transform(({ value, label }) => ({ value, label })),
]);

export const commentOptionsSchema = z
  .object({
    data: z
      .object({
        statuses: z.array(optionSchema).default([]),
        target_types: z.array(optionSchema).default([]),
      })
      .passthrough(),
  })
  .passthrough()
  .transform(({ data }) => data);

export const commentsQuerySchema = z.strictObject({
  search: z.string().trim().min(1).max(180).optional(),
  status: z.enum(commentStatuses).optional(),
  target_type: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(10).max(100).default(20),
});

export const bulkDeleteCommentsSchema = z.strictObject({
  ids: z
    .array(z.coerce.number().int().positive())
    .min(1)
    .max(100)
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "لا يمكن تكرار التعليق.",
    ),
});

export const commentDeleteResponseSchema = z
  .object({
    message: z.string().optional(),
    deleted_count: count.optional(),
    data: z
      .object({
        requested_count: count.optional(),
        deleted_count: count,
      })
      .passthrough()
      .optional(),
  })
  .passthrough()
  .transform(({ message, deleted_count, data }) => ({
    message,
    deleted_count: data?.deleted_count ?? deleted_count ?? 0,
    requested_count: data?.requested_count,
  }));

export function normalizeCommentsQuery(
  value: Record<string, unknown>,
): z.output<typeof commentsQuerySchema> {
  const candidate = Object.fromEntries(
    Object.entries(value).filter(
      ([, entry]) => entry !== undefined && entry !== null && entry !== "",
    ),
  );
  const parsed = commentsQuerySchema.safeParse(candidate);
  return parsed.success ? parsed.data : { page: 1, per_page: 20 };
}
