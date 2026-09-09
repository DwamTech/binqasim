import { z } from "zod";

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullable();

const nullableUrl = z
  .string()
  .trim()
  .max(255)
  .refine((value) => {
    if (value === "") return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "أدخل رابطًا صحيحًا يبدأ بـ http أو https.")
  .transform((value) => value || null)
  .nullable();

const nullableEmail = z
  .string()
  .trim()
  .max(255)
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "أدخل بريدًا إلكترونيًا صحيحًا.",
  )
  .transform((value) => value || null)
  .nullable();

export const socialSettingsSchema = z.strictObject({
  youtube: nullableUrl,
  twitter: nullableUrl,
  facebook: nullableUrl,
  snapchat: nullableUrl,
  instagram: nullableUrl,
  tiktok: nullableUrl,
});

export const phoneSettingsSchema = z.strictObject({
  support_phone: nullableText(20),
  management_phone: nullableText(20),
  backup_phone: nullableText(20),
});

export const businessSettingsSchema = z.strictObject({
  address: nullableText(500),
  commercial_register: nullableText(50),
  email: nullableEmail,
});

export const siteContactSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  social: socialSettingsSchema,
  phones: phoneSettingsSchema,
  business_details: businessSettingsSchema,
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const siteContactUpdateSchema = socialSettingsSchema
  .extend(phoneSettingsSchema.shape)
  .extend(businessSettingsSchema.shape);

export const siteContactUpdateResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: siteContactSchema.omit({ created_at: true }).partial({
    social: true,
    phones: true,
    business_details: true,
  }),
});

export const familyUpdateResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.record(z.string(), z.unknown()),
});

export const supportSettingKeys = [
  "individual_support_enabled",
  "institutional_support_enabled",
  "module_articles_enabled",
  "module_audios_enabled",
  "module_listening_enabled",
  "module_hadith_cards_enabled",
  "module_visuals_enabled",
  "module_scientific_videos_enabled",
  "module_galleries_enabled",
  "module_library_enabled",
  "module_dissertations_enabled",
  "module_scientific_fatwas_enabled",
  "module_links_enabled",
] as const;

export const supportSettingsSchema = z.strictObject({
  site_status: z.enum(["open", "closed"]),
  individual_support_enabled: z.boolean(),
  institutional_support_enabled: z.boolean(),
  module_articles_enabled: z.boolean(),
  module_audios_enabled: z.boolean(),
  // Older shared backends do not return this additive key yet. Their backend
  // middleware also defaults a missing setting to enabled, so mirror that here.
  module_listening_enabled: z.boolean().default(true),
  // Additive site module; absence on an older shared backend means enabled.
  module_hadith_cards_enabled: z.boolean().default(true),
  module_visuals_enabled: z.boolean(),
  // This site-specific module is additive; older shared backends default a
  // missing setting to enabled in the same way as the Laravel middleware.
  module_scientific_videos_enabled: z.boolean().default(true),
  module_galleries_enabled: z.boolean(),
  module_library_enabled: z.boolean(),
  module_dissertations_enabled: z.boolean().default(true),
  module_scientific_fatwas_enabled: z.boolean().default(true),
  module_links_enabled: z.boolean(),
});

export const supportSettingUpdateSchema = z.strictObject({
  key: z.enum(supportSettingKeys),
  value: z.boolean(),
});

export const supportBulkUpdateSchema = z.strictObject({
  value: z.boolean(),
});

export const messageResponseSchema = z.object({ message: z.string() });

export const siteStatusSchema = z.strictObject({
  status: z.enum(["open", "closed"]),
});

export const siteStatusUpdateResponseSchema = z.object({
  message: z.string(),
  status: z.enum(["open", "closed"]),
});

export const systemContentKeys = ["about_waqf", "masaref_alre3"] as const;
export type SystemContentKey = (typeof systemContentKeys)[number];

export const systemContentLabels: Record<SystemContentKey, string> = {
  about_waqf: "عن الوقف",
  masaref_alre3: "مصارف الريع",
};

export const systemContentSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(String).optional(),
  key: z.enum(systemContentKeys),
  content: z.string(),
  exists: z.boolean().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const systemContentUpdateSchema = z.strictObject({
  content: z.string().trim().min(1, "المحتوى مطلوب."),
});

export const systemContentUpdateResponseSchema = z.object({
  message: z.string(),
  data: systemContentSchema,
});

export const settingsTabs = [
  "contact",
  "support",
  "status",
  "content",
] as const;
export type SettingsTab = (typeof settingsTabs)[number];

export function normalizeSettingsTab(
  value: string | string[] | undefined,
  isAdmin: boolean,
): SettingsTab {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate === "contact") return candidate;
  return isAdmin &&
    settingsTabs.includes(candidate as (typeof settingsTabs)[number])
    ? (candidate as SettingsTab)
    : "contact";
}

export type SiteContact = z.infer<typeof siteContactSchema>;
export type SocialSettings = z.input<typeof socialSettingsSchema>;
export type PhoneSettings = z.input<typeof phoneSettingsSchema>;
export type BusinessSettings = z.input<typeof businessSettingsSchema>;
export type SupportSettings = z.infer<typeof supportSettingsSchema>;
export type SupportSettingKey = (typeof supportSettingKeys)[number];
export type SiteStatus = z.infer<typeof siteStatusSchema>["status"];
