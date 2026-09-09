import { z } from "zod";

export const hadithCardAccents = ["brown", "blue"] as const;
export const hadithCardStatuses = ["draft", "scheduled", "published"] as const;
export const hadithCardImageSources = ["file", "url"] as const;

export type HadithCardAccent = (typeof hadithCardAccents)[number];
export type HadithCardStatus = (typeof hadithCardStatuses)[number];
export type HadithCardImageSource = (typeof hadithCardImageSources)[number];
export type HadithCardCoverImageSource =
  | HadithCardImageSource
  | "none";

const identifier = z.union([z.string(), z.number()]).transform(String);
const nullableText = z.preprocess(
  (value) =>
    value === undefined || value === null || value === "" ? null : value,
  z.string().nullable(),
);
const booleanValue = z.preprocess((value) => {
  if (value === true || value === 1 || value === "1" || value === "true")
    return true;
  if (value === false || value === 0 || value === "0" || value === "false")
    return false;
  return value;
}, z.boolean());

export const hadithCardSchema = z
  .object({
    id: identifier,
    hadith_card_project_id: identifier,
    slug: nullableText,
    title: nullableText,
    alt_text: z.string().trim().min(1),
    image_source_type: z.enum(hadithCardImageSources),
    image_source_url: nullableText.optional().default(null),
    image_url: nullableText,
    sort_order: z.coerce.number().int().nonnegative(),
    is_published: booleanValue,
    published_at: nullableText,
    status: z.enum(hadithCardStatuses),
    views_count: z.coerce.number().int().nonnegative().default(0),
    created_at: nullableText.optional().default(null),
    updated_at: nullableText.optional().default(null),
  })
  .passthrough();

export type HadithCard = z.infer<typeof hadithCardSchema>;

export const hadithCardProjectSchema = z
  .object({
    id: identifier,
    slug: z.string().trim().min(1),
    title: z.string().trim().min(1),
    eyebrow: nullableText,
    description: nullableText,
    cover_image_source_type: z
      .enum(hadithCardImageSources)
      .nullable()
      .optional()
      .default(null),
    cover_image_url: nullableText.optional().default(null),
    cover_alt_text: nullableText.optional().default(null),
    accent: z.enum(hadithCardAccents),
    sort_order: z.coerce.number().int().nonnegative(),
    is_featured: booleanValue,
    is_published: booleanValue,
    published_at: nullableText,
    status: z.enum(hadithCardStatuses),
    cards_count: z.coerce.number().int().nonnegative().default(0),
    published_cards_count: z.coerce.number().int().nonnegative().default(0),
    cards: z.array(hadithCardSchema).optional().default([]),
    views_count: z.coerce.number().int().nonnegative().default(0),
    created_at: nullableText.optional().default(null),
    updated_at: nullableText.optional().default(null),
  })
  .passthrough();

export type HadithCardProject = z.infer<typeof hadithCardProjectSchema>;

const pageMetaSchema = z
  .object({
    current_page: z.coerce.number().int().positive(),
    last_page: z.coerce.number().int().positive(),
    per_page: z.coerce.number().int().positive(),
    total: z.coerce.number().int().nonnegative(),
  })
  .passthrough();

const projectStatsSchema = z
  .object({
    total: z.coerce.number().int().nonnegative(),
    published: z.coerce.number().int().nonnegative(),
    drafts: z.coerce.number().int().nonnegative(),
    cards: z.coerce.number().int().nonnegative(),
  })
  .passthrough();

export const hadithCardProjectPageSchema = z
  .object({
    data: z.array(hadithCardProjectSchema),
    meta: pageMetaSchema,
    stats: projectStatsSchema,
    filter_options: z
      .object({
        accents: z
          .array(
            z.object({
              value: z.enum(hadithCardAccents),
              label: z.string().trim().min(1),
            }),
          )
          .default([]),
        statuses: z
          .array(
            z.object({
              value: z.enum(hadithCardStatuses),
              label: z.string().trim().min(1),
            }),
          )
          .default([]),
      })
      .passthrough(),
  })
  .passthrough();

export type HadithCardProjectPage = z.infer<typeof hadithCardProjectPageSchema>;

export const hadithCardProjectDetailSchema = z
  .object({ data: hadithCardProjectSchema })
  .passthrough()
  .transform(({ data }) => data);
export const hadithCardDetailSchema = z
  .object({ data: hadithCardSchema })
  .passthrough()
  .transform(({ data }) => data);

export const hadithCardProjectMutationSchema = z
  .object({ message: z.string(), data: hadithCardProjectSchema })
  .passthrough();
export const hadithCardMutationSchema = z
  .object({ message: z.string(), data: hadithCardSchema })
  .passthrough();
export const hadithCardDeleteSchema = z
  .object({ message: z.string() })
  .passthrough();

const hadithCardBulkPayloadSchema = z.union([
  z.array(hadithCardSchema),
  z
    .object({
      cards: z.array(hadithCardSchema).optional(),
      created: z.array(hadithCardSchema).optional(),
      items: z.array(hadithCardSchema).optional(),
      created_count: z.coerce.number().int().nonnegative().optional(),
    })
    .passthrough(),
]);

/**
 * The API returns the resources it created. The permissive inner shape keeps
 * the BFF forward-compatible with an additive `created`/`cards` naming choice
 * while presenting one stable client contract.
 */
export const hadithCardBulkMutationSchema = z
  .object({ message: z.string(), data: hadithCardBulkPayloadSchema })
  .passthrough()
  .transform(({ message, data }) => {
    const cards = Array.isArray(data)
      ? data
      : (data.cards ?? data.created ?? data.items ?? []);
    const createdCount = Array.isArray(data)
      ? data.length
      : (data.created_count ?? cards.length);
    return { message, data: { cards, created_count: createdCount } };
  });

export type HadithCardBulkMutation = z.infer<
  typeof hadithCardBulkMutationSchema
>;

const queryText = z.string().trim().min(1).max(180).optional();
export const hadithCardProjectQuerySchema = z.strictObject({
  search: queryText,
  accent: z.enum(hadithCardAccents).optional(),
  status: z.enum(hadithCardStatuses).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(50),
});
export type HadithCardProjectQuery = z.infer<
  typeof hadithCardProjectQuerySchema
>;

export type HadithCardProjectFormValues = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  cover_image_source_type: HadithCardCoverImageSource;
  cover_image_url: string;
  cover_alt_text: string;
  accent: HadithCardAccent;
  sort_order: string;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
};

export type HadithCardFormValues = {
  hadith_card_project_id: string;
  slug: string;
  title: string;
  alt_text: string;
  image_source_type: HadithCardImageSource;
  image_url: string;
  sort_order: string;
  is_published: boolean;
  published_at: string;
};

export type HadithCardFormFiles = { image_file?: File };
export type HadithCardProjectFormFiles = {
  cover_image_file?: File;
  gallery_files?: File[];
};

export const emptyHadithCardProjectForm: HadithCardProjectFormValues = {
  slug: "",
  title: "",
  eyebrow: "",
  description: "",
  cover_image_source_type: "none",
  cover_image_url: "",
  cover_alt_text: "",
  accent: "brown",
  sort_order: "",
  is_featured: false,
  is_published: false,
  published_at: "",
};

export function emptyHadithCardForm(
  projectId = "",
  sortOrder = "",
): HadithCardFormValues {
  return {
    hadith_card_project_id: projectId,
    slug: "",
    title: "",
    alt_text: "",
    image_source_type: "file",
    image_url: "",
    sort_order: sortOrder,
    is_published: false,
    published_at: "",
  };
}

export function projectToHadithCardProjectForm(
  project: HadithCardProject,
): HadithCardProjectFormValues {
  return {
    slug: project.slug,
    title: project.title,
    eyebrow: project.eyebrow ?? "",
    description: project.description ?? "",
    cover_image_source_type: project.cover_image_source_type ?? "none",
    cover_image_url:
      project.cover_image_source_type === "url"
        ? (project.cover_image_url ?? "")
        : "",
    cover_alt_text: project.cover_alt_text ?? "",
    accent: project.accent,
    sort_order: String(project.sort_order),
    is_featured: project.is_featured,
    is_published: project.is_published,
    published_at: project.published_at ? project.published_at.slice(0, 16) : "",
  };
}

export function cardToHadithCardForm(card: HadithCard): HadithCardFormValues {
  return {
    hadith_card_project_id: card.hadith_card_project_id,
    slug: card.slug ?? "",
    title: card.title ?? "",
    alt_text: card.alt_text,
    image_source_type: card.image_source_type,
    image_url: card.image_source_url ?? "",
    sort_order: String(card.sort_order),
    is_published: card.is_published,
    published_at: card.published_at ? card.published_at.slice(0, 16) : "",
  };
}

export function hadithCardStatusLabel(status: HadithCardStatus): string {
  return ({ draft: "مسودة", scheduled: "مجدول", published: "منشور" } as const)[
    status
  ];
}

export function hadithCardAccentLabel(accent: HadithCardAccent): string {
  return ({ brown: "بني ذهبي", blue: "أزرق هادئ" } as const)[accent];
}

function appendText(form: FormData, key: string, value: string): void {
  form.set(key, value.trim());
}

export function createHadithCardProjectFormData(
  values: HadithCardProjectFormValues,
  files: HadithCardProjectFormFiles = {},
): FormData {
  const form = new FormData();
  appendText(form, "slug", values.slug);
  appendText(form, "title", values.title);
  appendText(form, "eyebrow", values.eyebrow);
  appendText(form, "description", values.description);
  form.set(
    "cover_image_source_type",
    values.cover_image_source_type === "none"
      ? ""
      : values.cover_image_source_type,
  );
  appendText(
    form,
    "cover_image_url",
    values.cover_image_source_type === "url" ? values.cover_image_url : "",
  );
  appendText(
    form,
    "cover_alt_text",
    values.cover_image_source_type === "none" ? "" : values.cover_alt_text,
  );
  form.set(
    "remove_cover",
    values.cover_image_source_type === "none" ? "1" : "0",
  );
  if (files.cover_image_file) {
    form.set("cover_image_file", files.cover_image_file);
  }
  for (const file of files.gallery_files ?? []) {
    form.append("gallery_files[]", file);
  }
  form.set("accent", values.accent);
  appendText(form, "sort_order", values.sort_order);
  form.set("is_featured", values.is_featured ? "1" : "0");
  form.set("is_published", values.is_published ? "1" : "0");
  appendText(form, "published_at", values.published_at);
  return form;
}

export function createHadithCardFormData(
  values: HadithCardFormValues,
  files: HadithCardFormFiles,
): FormData {
  const form = new FormData();
  form.set("hadith_card_project_id", values.hadith_card_project_id);
  appendText(form, "slug", values.slug);
  appendText(form, "title", values.title);
  appendText(form, "alt_text", values.alt_text);
  form.set("image_source_type", values.image_source_type);
  appendText(form, "image_url", values.image_url);
  appendText(form, "sort_order", values.sort_order);
  form.set("is_published", values.is_published ? "1" : "0");
  appendText(form, "published_at", values.published_at);
  if (files.image_file) form.set("image_file", files.image_file);
  return form;
}

export function validateHadithCardProjectForm(
  values: HadithCardProjectFormValues,
  files: HadithCardProjectFormFiles = {},
  initial?: HadithCardProject,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (values.title.trim().length < 2) errors.title = ["عنوان القسم مطلوب."];
  if (values.slug && !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(values.slug)) {
    errors.slug = ["الرابط المختصر يقبل الحروف والأرقام والشرطات فقط."];
  }
  if (
    values.sort_order &&
    (!Number.isInteger(Number(values.sort_order)) ||
      Number(values.sort_order) < 0)
  ) {
    errors.sort_order = ["الترتيب يجب أن يكون رقمًا صحيحًا موجبًا أو صفرًا."];
  }
  if (
    values.cover_image_source_type === "file" &&
    !files.cover_image_file &&
    !(initial?.cover_image_source_type === "file" && initial.cover_image_url)
  ) {
    errors.cover_image_file = ["اختر صورة غلاف القسم."];
  }
  if (values.cover_image_source_type === "url") {
    const url = values.cover_image_url.trim();
    if (!/^(?:\/|https?:\/\/)/i.test(url)) {
      errors.cover_image_url = ["أدخل رابط غلاف صالحًا أو مسارًا يبدأ بـ /. "];
    }
  }
  if (
    values.cover_image_source_type !== "none" &&
    values.cover_alt_text.trim().length < 3
  ) {
    errors.cover_alt_text = ["الوصف البديل لغلاف القسم مطلوب."];
  }
  if (
    files.cover_image_file &&
    files.cover_image_file.size > 10 * 1024 * 1024
  ) {
    errors.cover_image_file = ["حجم غلاف القسم يجب ألا يتجاوز ١٠MB."];
  }
  return errors;
}

function isGalleryImage(file: File): boolean {
  const mimeAllowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ].includes(file.type.toLocaleLowerCase());
  const extensionAllowed = /\.(?:jpe?g|png|webp|avif)$/i.test(file.name);
  return mimeAllowed || (file.type === "" && extensionAllowed);
}

export function validateHadithCardGalleryFiles(
  files: readonly File[],
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (files.length === 0) {
    errors.gallery_files = ["اختر صورة واحدة على الأقل للجاليري."];
    return errors;
  }
  if (files.some((file) => !isGalleryImage(file))) {
    errors.gallery_files = [
      "صور الجاليري تقبل JPEG أو PNG أو WEBP أو AVIF فقط.",
    ];
  } else if (files.some((file) => file.size > 10 * 1024 * 1024)) {
    errors.gallery_files = ["حجم كل صورة يجب ألا يتجاوز ١٠MB."];
  }
  return errors;
}

export function createHadithCardGalleryFormData(
  files: readonly File[],
): FormData {
  const form = new FormData();
  for (const file of files) form.append("gallery_files[]", file);
  return form;
}

export function validateHadithCardForm(
  values: HadithCardFormValues,
  files: HadithCardFormFiles,
  initial?: HadithCard,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (!values.hadith_card_project_id)
    errors.hadith_card_project_id = ["اختر المشروع."];
  if (values.alt_text.trim().length < 3)
    errors.alt_text = ["الوصف البديل للصورة مطلوب."];
  if (values.slug && !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(values.slug)) {
    errors.slug = ["الرابط المختصر يقبل الحروف والأرقام والشرطات فقط."];
  }
  if (
    values.sort_order &&
    (!Number.isInteger(Number(values.sort_order)) ||
      Number(values.sort_order) < 0)
  ) {
    errors.sort_order = ["الترتيب يجب أن يكون رقمًا صحيحًا موجبًا أو صفرًا."];
  }
  if (
    values.image_source_type === "file" &&
    !files.image_file &&
    !(initial?.image_source_type === "file" && initial.image_url)
  ) {
    errors.image_file = ["اختر صورة البطاقة."];
  }
  if (values.image_source_type === "url") {
    const url = values.image_url.trim();
    if (!/^(?:\/|https?:\/\/)/i.test(url)) {
      errors.image_url = ["أدخل رابط صورة صالحًا أو مسارًا يبدأ بـ /."];
    }
  }
  if (files.image_file && files.image_file.size > 10 * 1024 * 1024) {
    errors.image_file = ["حجم الصورة يجب ألا يتجاوز ١٠MB."];
  }
  return errors;
}
