import { z } from "zod";

export const feedbackTypes = ["complaint", "suggestion"] as const;
export const feedbackStatuses = [
  "new",
  "under_review",
  "resolved",
  "rejected",
  "archived",
] as const;

export type FeedbackType = (typeof feedbackTypes)[number];
export type FeedbackStatus = (typeof feedbackStatuses)[number];

export const feedbackTypeLabels: Record<FeedbackType, string> = {
  complaint: "الشكاوى",
  suggestion: "المقترحات",
};

export const feedbackStatusLabels: Record<FeedbackStatus, string> = {
  new: "جديد",
  under_review: "قيد المراجعة",
  resolved: "تم الحل",
  rejected: "مرفوض",
  archived: "مؤرشف",
};

const nullableText = z.string().nullable();
const reviewerSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string(),
    email: z.string().email().optional(),
  })
  .nullable()
  .optional();

export const feedbackItemSchema = z.object({
  id: z.number().int().positive(),
  request_number: z.string(),
  type: z.enum(feedbackTypes),
  status: z.enum(feedbackStatuses),
  name: nullableText,
  email: nullableText,
  phone: nullableText,
  category: nullableText,
  message: nullableText,
  rating: z.number().int().nullable(),
  admin_note: nullableText,
  reviewed_at: nullableText,
  created_at: z.string(),
  updated_at: z.string(),
  reviewer: reviewerSchema,
});

export const feedbackPageSchema = z.object({
  current_page: z.number().int().positive(),
  data: z.array(feedbackItemSchema),
  last_page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  from: z.number().int().nullable().optional(),
  to: z.number().int().nullable().optional(),
});

export const feedbackStatusUpdateSchema = feedbackItemSchema;

export const feedbackQuerySchema = z.object({
  type: z.enum(feedbackTypes).default("complaint"),
  status: z.enum(feedbackStatuses).optional(),
  search: z.string().trim().max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(15),
});

export type FeedbackItem = z.infer<typeof feedbackItemSchema>;
export type FeedbackPage = z.infer<typeof feedbackPageSchema>;
export type FeedbackQuery = z.input<typeof feedbackQuerySchema>;

export function normalizeFeedbackQuery(
  value: Record<string, unknown>,
): z.output<typeof feedbackQuerySchema> {
  return feedbackQuerySchema.parse(value);
}

export function formatFeedbackDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
