import { z } from "zod";

import {
  libraryIndexSubmissionStatuses,
  libraryIndexSubmissionTypes,
} from "./library-indexes.contracts";

const nullableText = z.string().nullable();

const reviewerSchema = z
  .object({
    id: z.union([z.number().int().positive(), z.string().trim().min(1)]),
    name: z.string().trim().min(1),
    email: z.string().email().nullable().optional(),
  })
  .nullable();

export const libraryIndexSubmissionSchema = z.object({
  id: z.number().int().positive(),
  type: z.enum(libraryIndexSubmissionTypes),
  name: z.string().trim().min(1),
  title: nullableText,
  visit_date: nullableText,
  status: z.enum(libraryIndexSubmissionStatuses),
  image_url: nullableText,
  reviewed_at: nullableText,
  reviewer: reviewerSchema,
  rejection_reason: nullableText,
  created_at: z.string().trim().min(1),
  updated_at: nullableText.optional(),
});

const countsSchema = z.object({
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  approved: z.number().int().nonnegative(),
  rejected: z.number().int().nonnegative(),
});

const statsSchema = countsSchema.extend({
  by_type: z.object({
    golden_visit: countsSchema,
    guest: countsSchema,
  }),
});

const filterOptionsSchema = z.object({
  types: z.array(
    z.object({
      value: z.enum(libraryIndexSubmissionTypes),
      label: z.string().trim().min(1),
    }),
  ),
  statuses: z.array(z.enum(libraryIndexSubmissionStatuses)),
});

const paginationMetaSchema = z.object({
  current_page: z.number().int().positive(),
  last_page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  from: z.number().int().positive().nullable().optional(),
  to: z.number().int().positive().nullable().optional(),
});

export const libraryIndexSubmissionsResponseSchema = z
  .object({
    data: z.array(libraryIndexSubmissionSchema),
    meta: paginationMetaSchema,
    filter_options: filterOptionsSchema,
    stats: statsSchema,
  })
  .transform(({ data, meta, filter_options, stats }) => ({
    ...meta,
    data,
    filter_options,
    stats,
  }));

export const libraryIndexSubmissionResponseSchema = z
  .object({
    data: libraryIndexSubmissionSchema,
    message: z.string().optional(),
  })
  .transform(({ data }) => data);

export const libraryIndexSubmissionsQuerySchema = z.object({
  type: z.enum(libraryIndexSubmissionTypes).optional(),
  status: z.enum(libraryIndexSubmissionStatuses).optional(),
  search: z.string().trim().min(1).max(180).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(20),
});

export const libraryIndexRejectionSchema = z.object({
  rejection_reason: z.string().trim().min(3).max(1000),
});

export function isLibraryIndexSubmissionType(
  value: string,
): value is (typeof libraryIndexSubmissionTypes)[number] {
  return libraryIndexSubmissionTypes.some((type) => type === value);
}
