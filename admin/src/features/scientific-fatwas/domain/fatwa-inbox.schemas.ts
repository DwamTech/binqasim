import { z } from "zod";

import {
  scientificFatwaCategoryOptionSchema,
  scientificFatwaCategorySchema,
} from "./scientific-fatwas.schemas";

const identifier = z.union([z.string(), z.number()]).transform(String);
const nullableIdentifier = z.preprocess(
  (value) =>
    value === undefined || value === null || value === "" ? null : value,
  identifier.nullable(),
);
const nullableText = z.preprocess(
  (value) => (value === undefined || value === null ? null : value),
  z.string().nullable(),
);
const booleanValue = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return false;
  if (value === true || value === 1 || value === "1" || value === "true")
    return true;
  if (value === false || value === 0 || value === "0" || value === "false")
    return false;
  return value;
}, z.boolean());

export const fatwaInboxStatusSchema = z.enum(["new", "answered", "archived"]);
export const fatwaVisibilitySchema = z.enum(["public", "private"]);

const shared = {
  id: identifier,
  reference_number: z.string(),
  name: nullableText,
  email: z.string().email(),
  question_title: nullableText.default(null),
  status: fatwaInboxStatusSchema,
  status_label: z.string().default(""),
  visibility: fatwaVisibilitySchema.nullable().default(null),
  category: nullableText.default(null),
  category_id: nullableIdentifier.default(null),
  category_option: scientificFatwaCategoryOptionSchema.nullable().default(null),
  is_listed: booleanValue.default(false),
  public_url: nullableText.default(null),
  created_at: z.string(),
  answered_at: nullableText.default(null),
};

export const fatwaInboxListItemSchema = z.object({
  ...shared,
  question_preview: z.string(),
});

const activityLogSchema = z.object({
  id: identifier,
  action: z.string(),
  user_id: nullableIdentifier.default(null),
  created_at: z.string(),
  new_values: z.record(z.string(), z.unknown()).nullable().default(null),
});

export const fatwaInboxDetailItemSchema = z.object({
  ...shared,
  question: z.string(),
  answer: nullableText.default(null),
  answered_by: nullableIdentifier.default(null),
  archived_by: nullableIdentifier.default(null),
  archived_at: nullableText.default(null),
  published_at: nullableText.default(null),
  answer_revision: z.coerce.number().int().nonnegative().default(0),
  answer_notification_sent_at: nullableText.default(null),
  updated_at: z.string(),
  category_options: z.array(scientificFatwaCategorySchema).default([]),
  activity_logs: z.array(activityLogSchema).default([]),
});

const pageMeta = z.object({
  current_page: z.coerce.number().int().positive(),
  last_page: z.coerce.number().int().positive(),
  per_page: z.coerce.number().int().positive(),
  total: z.coerce.number().int().nonnegative(),
});

export const fatwaInboxPageSchema = z
  .object({
    data: z.array(fatwaInboxListItemSchema),
    meta: pageMeta,
  })
  .passthrough()
  .transform(({ data, meta }) => ({ data, ...meta }));

export const fatwaInboxSummarySchema = z
  .object({
    data: z.object({
      total: z.coerce.number().int().nonnegative(),
      new: z.coerce.number().int().nonnegative(),
      answered: z.coerce.number().int().nonnegative(),
      archived: z.coerce.number().int().nonnegative(),
      public: z.coerce.number().int().nonnegative(),
      private: z.coerce.number().int().nonnegative(),
    }),
  })
  .passthrough()
  .transform(({ data }) => data);

export const fatwaInboxDetailSchema = z.union([
  z
    .object({ data: fatwaInboxDetailItemSchema })
    .passthrough()
    .transform(({ data }) => data),
  fatwaInboxDetailItemSchema,
]);

export const fatwaInboxMutationItemSchema = z.object({
  id: identifier,
  reference_number: z.string(),
  status: fatwaInboxStatusSchema,
  visibility: fatwaVisibilitySchema.nullable().default(null),
  answer: nullableText.default(null),
  question_title: nullableText.default(null),
  category: nullableText.default(null),
  category_id: nullableIdentifier.default(null),
  category_option: scientificFatwaCategoryOptionSchema.nullable().default(null),
  is_listed: booleanValue.default(false),
  public_url: nullableText.default(null),
  answered_at: nullableText.default(null),
  archived_at: nullableText.default(null),
  published_at: nullableText.default(null),
  answer_revision: z.coerce.number().int().nonnegative().default(0),
  updated_at: z.string(),
});

export const fatwaInboxMutationSchema = z
  .object({ data: fatwaInboxMutationItemSchema })
  .passthrough()
  .transform(({ data }) => data);

const queryText = z.string().trim().min(1).max(200).optional();
export const fatwaInboxQuerySchema = z.strictObject({
  search: queryText,
  status: fatwaInboxStatusSchema.optional(),
  visibility: fatwaVisibilitySchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});
