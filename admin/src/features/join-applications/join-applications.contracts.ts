import { z } from "zod";

export const joinApplicationTypes = [
  "members",
  "volunteers",
  "guides",
  "jobs",
] as const;
export type JoinApplicationType = (typeof joinApplicationTypes)[number];

export const joinApplicationStatuses = [
  "new",
  "under_review",
  "accepted",
  "rejected",
  "needs_more_info",
  "archived",
] as const;
export type JoinApplicationStatus = (typeof joinApplicationStatuses)[number];

export const joinApplicationTypeLabels: Record<JoinApplicationType, string> = {
  members: "عضوية الجمعية",
  volunteers: "متطوعو الجمعية",
  guides: "طلبات الإرشاد السياحي",
  jobs: "طلبات التوظيف",
};

export const joinApplicationStatusLabels: Record<
  JoinApplicationStatus,
  string
> = {
  new: "جديد",
  under_review: "قيد المراجعة",
  accepted: "مقبول",
  rejected: "مرفوض",
  needs_more_info: "يحتاج بيانات",
  archived: "مؤرشف",
};

export const joinApplicationTypeSchema = z.enum(joinApplicationTypes);
export const joinApplicationStatusSchema = z.enum(joinApplicationStatuses);

export const joinAttachmentSchema = z.object({
  id: z.number().int().positive(),
  type: z.string(),
  original_name: z.string().nullable().optional(),
  mime_type: z.string().nullable().optional(),
  size: z.number().nullable().optional(),
  url: z.string().optional(),
});

export const joinApplicationSchema = z
  .object({
    id: z.number().int().positive(),
    request_number: z.string(),
    status: joinApplicationStatusSchema,
    admin_note: z.string().nullable().optional(),
    reviewed_at: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
    full_name: z.string(),
    national_id: z.string(),
    birth_date: z.string().nullable().optional(),
    gender: z.string().nullable().optional(),
    blood_type: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    account_username: z.string().nullable().optional(),
    education_level: z.string().nullable().optional(),
    academic_specialization: z.string().nullable().optional(),
    specialization: z.string().nullable().optional(),
    skills: z.string().nullable().optional(),
    languages: z.string().nullable().optional(),
    years_of_experience: z.union([z.number(), z.string()]).nullable().optional(),
    experience_field: z.string().nullable().optional(),
    experience_scope: z.string().nullable().optional(),
    previous_guiding_audience: z.string().nullable().optional(),
    is_employed: z.boolean().nullable().optional(),
    current_work_type: z.string().nullable().optional(),
    current_job: z.string().nullable().optional(),
    affiliated_entity: z.string().nullable().optional(),
    tour_guidance_scope: z.string().nullable().optional(),
    tour_routes: z.string().nullable().optional(),
    tours_count: z.number().int().nonnegative().nullable().optional(),
    tour_scope: z.string().nullable().optional(),
    has_tour_guide_license: z.boolean().nullable().optional(),
    tour_guide_license_expires_at: z.string().nullable().optional(),
    attachments: z.array(joinAttachmentSchema).optional().default([]),
    reviewer: z
      .object({
        id: z.coerce.string(),
        name: z.string(),
      })
      .nullable()
      .optional(),
  })
  .catchall(z.unknown());

export type JoinApplication = z.infer<typeof joinApplicationSchema>;

export const joinApplicationPageSchema = z.object({
  data: z.array(joinApplicationSchema),
  current_page: z.number().int(),
  last_page: z.number().int(),
  per_page: z.number().int(),
  total: z.number().int(),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
});

export type JoinApplicationPage = z.infer<typeof joinApplicationPageSchema>;

export const joinApplicationQuerySchema = z.object({
  status: joinApplicationStatusSchema.optional(),
  search: z.string().trim().max(255).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(5).max(100).default(15),
});

export function isJoinApplicationType(
  value: string,
): value is JoinApplicationType {
  return joinApplicationTypeSchema.safeParse(value).success;
}

export function formatJoinApplicationDate(value?: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
