import { z } from "zod";
import { ARABIC_DISPLAY_LOCALE } from "@/shared/lib/arabic-format";
import { dashboardCopy } from "@/core/config/dashboard-copy";

export const backendSectionModules = [
  "articles",
  "books",
  "visuals",
  "galleries",
  "gallery_media",
] as const;

export const managedSectionModules = ["articles", "books", "visuals"] as const;

export type SectionModule = (typeof backendSectionModules)[number];
export type ManagedSectionModule = (typeof managedSectionModules)[number];

export const sectionModuleLabels: Record<ManagedSectionModule, string> = {
  articles: dashboardCopy.modules.articles.plural,
  books: dashboardCopy.modules.books.plural,
  visuals: dashboardCopy.modules.visuals.plural,
};

export const sectionSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  name: z.string(),
  slug: z.string(),
  module: z.enum(backendSectionModules).nullable(),
  parent_id: z
    .union([z.number(), z.string()])
    .transform(String)
    .nullable()
    .optional(),
  sort_order: z.number().int().nonnegative().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
  user_id: z.union([z.number(), z.string()]).nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const sectionPageSchema = z.object({
  current_page: z.number().int().positive(),
  data: z.array(sectionSchema),
  last_page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  from: z.number().int().nullable().optional(),
  to: z.number().int().nullable().optional(),
});

export const sectionMutationResponseSchema = z.object({
  message: z.string(),
  section: sectionSchema,
});

export const sectionDeleteResponseSchema = z.object({ message: z.string() });

export const sectionFormSchema = z.strictObject({
  name: z.string().trim().min(1).max(255),
  module: z.enum(managedSectionModules),
  description: z.string().trim().nullable(),
  is_active: z.boolean(),
});

export const sectionQuerySchema = z.strictObject({
  search: z.string().trim().max(255).optional(),
  module: z.enum(managedSectionModules).optional(),
  page: z.coerce.number().int().positive().default(1),
});

export type Section = z.infer<typeof sectionSchema>;
export type SectionPage = z.infer<typeof sectionPageSchema>;
export type SectionFormValues = z.infer<typeof sectionFormSchema>;
export type SectionQuery = z.infer<typeof sectionQuerySchema>;

export function getSectionModuleLabel(module: SectionModule | null): string {
  if (module === null) return "قسم قديم غير محدد";
  return module in sectionModuleLabels
    ? sectionModuleLabels[module as ManagedSectionModule]
    : "موديول غير معروض";
}

export function normalizeSectionQuery(
  input: Record<string, string | undefined>,
): SectionQuery {
  const candidate = {
    ...(input.search?.trim() ? { search: input.search.trim() } : {}),
    ...(input.module ? { module: input.module } : {}),
    ...(input.page ? { page: input.page } : {}),
  };
  const result = sectionQuerySchema.safeParse(candidate);
  return result.success ? result.data : { page: 1 };
}

export function formatSectionDate(value?: string | null): string {
  if (!value) return "غير متاح";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "غير متاح"
    : new Intl.DateTimeFormat(ARABIC_DISPLAY_LOCALE, {
        dateStyle: "medium",
        timeZone: "Africa/Cairo",
      }).format(date);
}
