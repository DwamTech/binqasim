import { z } from "zod";

const comparisonSchema = z
  .object({
    available: z.boolean(),
    value: z.unknown(),
    formatted_value: z.string().nullable(),
    change: z.union([z.number(), z.string()]).nullable(),
    change_percentage: z.number().nullable(),
    percentage_change: z.number().nullable(),
    direction: z.string(),
    status: z.string(),
    reason: z.string().nullable(),
    warnings: z.array(z.string()),
  })
  .passthrough();

const metricSchema = z
  .object({
    key: z.string(),
    label: z.string(),
    description: z.string(),
    value: z.unknown(),
    formatted_value: z.string().nullable(),
    type: z.string(),
    available: z.boolean(),
    availability_status: z.string(),
    quality: z.string(),
    sensitivity: z.string(),
    reason: z.string().nullable(),
    comparison: comparisonSchema.nullable(),
    warnings: z.array(z.string()),
  })
  .passthrough();

const sectionSchema = z
  .object({
    key: z.string(),
    label: z.string(),
    description: z.string().nullable(),
    metrics: z.array(metricSchema),
    warnings: z.array(z.string()),
  })
  .passthrough();

export const reportPayloadSchema = z
  .object({
    report_key: z.string(),
    period: z
      .object({
        key: z.enum([
          "today",
          "yesterday",
          "last_7_days",
          "last_30_days",
          "last_90_days",
          "month_to_date",
          "quarter_to_date",
          "year_to_date",
          "custom",
        ]),
        date_from: z.string(),
        date_to: z.string(),
        timezone: z.string(),
        group_by: z.string(),
        compare: z.string(),
        starts_at_utc: z.string(),
        ends_at_utc: z.string(),
        previous_starts_at_utc: z.string().nullable(),
        previous_ends_at_utc: z.string().nullable(),
      })
      .passthrough(),
    sections: z.array(sectionSchema),
    warnings: z.array(z.string()),
    generated_at: z.string(),
  })
  .passthrough();

export const reportEnvelopeSchema = z
  .object({
    message: z.string(),
    data: reportPayloadSchema,
  })
  .passthrough();
