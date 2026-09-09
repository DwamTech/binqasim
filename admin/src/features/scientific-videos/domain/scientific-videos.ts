import { z } from "zod";

export const scientificVideoSourceTypes = ["file", "link", "embed"] as const;
export const scientificVideoStatuses = [
  "draft",
  "scheduled",
  "published",
] as const;
export type ScientificVideoSourceType =
  (typeof scientificVideoSourceTypes)[number];
export type ScientificVideoStatus = (typeof scientificVideoStatuses)[number];

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
const keywords = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;
  try {
    const decoded: unknown = JSON.parse(value);
    if (Array.isArray(decoded)) return decoded;
  } catch {
    // Comma-separated legacy values are normalized below.
  }
  return value
    .split(/[,،]/u)
    .map((part) => part.trim())
    .filter(Boolean);
}, z.array(z.string()));

export const scientificVideoItemSchema = z
  .object({
    id: identifier,
    slug: z.string().trim().min(1),
    category: z.string().trim().min(1),
    title: z.string().trim().min(1),
    description: z.string(),
    duration_minutes: z.coerce.number().int().positive(),
    duration_label: z.string().trim().min(1),
    date_label: z.string().trim().min(1),
    source_type: z.enum(scientificVideoSourceTypes),
    video_path: nullableText.optional().default(null),
    source_link: nullableText,
    source_url: nullableText.optional().default(null),
    watch_url: nullableText.optional().default(null),
    embed_url: nullableText.optional().default(null),
    admin_file_url: nullableText.optional().default(null),
    thumbnail_path: nullableText.optional().default(null),
    thumbnail_url: nullableText.optional().default(null),
    keywords,
    download_allowed: booleanValue,
    is_featured: booleanValue,
    is_published: booleanValue,
    status: z.enum(scientificVideoStatuses).optional(),
    published_at: nullableText,
    views_count: z.coerce.number().int().nonnegative().default(0),
    created_at: nullableText.optional().default(null),
    updated_at: nullableText.optional().default(null),
  })
  .passthrough();

export type ScientificVideoItem = z.infer<typeof scientificVideoItemSchema>;

export const scientificVideoPageSchema = z
  .object({
    data: z.array(scientificVideoItemSchema),
    links: z
      .object({
        first: nullableText,
        last: nullableText,
        prev: nullableText,
        next: nullableText,
      })
      .passthrough(),
    meta: z
      .object({
        current_page: z.coerce.number().int().positive(),
        last_page: z.coerce.number().int().positive(),
        per_page: z.coerce.number().int().positive(),
        total: z.coerce.number().int().nonnegative(),
        from: z.coerce.number().int().positive().nullable(),
        to: z.coerce.number().int().positive().nullable(),
      })
      .passthrough(),
  })
  .passthrough();

export type ScientificVideoPage = z.infer<typeof scientificVideoPageSchema>;

const option = z.union([
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

export const scientificVideoOptionsSchema = z
  .object({
    data: z
      .object({
        categories: z.array(option).default([]),
        source_types: z.array(option).default([]),
        statuses: z.array(option).default([]),
      })
      .passthrough(),
  })
  .passthrough()
  .transform(({ data }) => data);

export type ScientificVideoOption = { value: string; label: string };
export type ScientificVideoOptions = z.infer<
  typeof scientificVideoOptionsSchema
>;

export const scientificVideoDetailSchema = z
  .object({ data: scientificVideoItemSchema })
  .passthrough()
  .transform(({ data }) => data);
export const scientificVideoMutationSchema = z
  .object({ message: z.string(), data: scientificVideoItemSchema })
  .passthrough();
export const scientificVideoDeleteSchema = z
  .object({ message: z.string() })
  .passthrough();

export const scientificVideoQuerySchema = z.strictObject({
  search: z.string().trim().min(1).max(255).optional(),
  category: z.string().trim().min(1).max(120).optional(),
  source_type: z.enum(scientificVideoSourceTypes).optional(),
  status: z.enum(scientificVideoStatuses).optional(),
  is_featured: z.enum(["0", "1"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

export type ScientificVideoQuery = z.infer<typeof scientificVideoQuerySchema>;

export const fallbackScientificVideoOptions: ScientificVideoOptions = {
  categories: [
    "محاضرة علمية",
    "لقاء علمي",
    "درس مرئي",
    "درس تطبيقي",
    "ندوة علمية",
  ].map((value) => ({ value, label: value })),
  source_types: [
    { value: "file", label: "ملف فيديو مرفوع" },
    { value: "link", label: "رابط فيديو مباشر أو منصة" },
    { value: "embed", label: "رابط تضمين" },
  ],
  statuses: [
    { value: "draft", label: "مسودة" },
    { value: "scheduled", label: "مجدول" },
    { value: "published", label: "منشور" },
  ],
};

export function resolveScientificVideoOptions(
  options?: Partial<ScientificVideoOptions>,
): ScientificVideoOptions {
  return {
    categories: options?.categories?.length
      ? options.categories
      : fallbackScientificVideoOptions.categories,
    source_types: options?.source_types?.length
      ? options.source_types
      : fallbackScientificVideoOptions.source_types,
    statuses: options?.statuses?.length
      ? options.statuses
      : fallbackScientificVideoOptions.statuses,
  };
}

export type ScientificVideoFormValues = {
  slug: string;
  category: string;
  title: string;
  description: string;
  duration_minutes: string;
  date_label: string;
  source_type: ScientificVideoSourceType;
  source_link: string;
  keywords: string;
  download_allowed: boolean;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
};

export type ScientificVideoFormFiles = {
  video?: File;
  thumbnail?: File;
  removeThumbnail?: boolean;
};

export const emptyScientificVideoForm: ScientificVideoFormValues = {
  slug: "",
  category: "محاضرة علمية",
  title: "",
  description: "",
  duration_minutes: "",
  date_label: "",
  source_type: "link",
  source_link: "",
  keywords: "",
  download_allowed: false,
  is_featured: false,
  is_published: false,
  published_at: "",
};

export function scientificVideoStatus(
  item: Pick<ScientificVideoItem, "is_published" | "published_at">,
): ScientificVideoStatus {
  if (!item.is_published) return "draft";
  if (item.published_at && new Date(item.published_at).getTime() > Date.now())
    return "scheduled";
  return "published";
}

export function itemToScientificVideoForm(
  item: ScientificVideoItem,
): ScientificVideoFormValues {
  return {
    slug: item.slug,
    category: item.category,
    title: item.title,
    description: item.description,
    duration_minutes: String(item.duration_minutes),
    date_label: item.date_label,
    source_type: item.source_type,
    source_link: item.source_link ?? "",
    keywords: item.keywords.join("، "),
    download_allowed: item.download_allowed,
    is_featured: item.is_featured,
    is_published: item.is_published,
    published_at: item.published_at ? item.published_at.slice(0, 16) : "",
  };
}

export function validateScientificVideoForm(
  values: ScientificVideoFormValues,
  files: ScientificVideoFormFiles,
  initial?: ScientificVideoItem,
  allowExistingFile = false,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const required = (field: keyof ScientificVideoFormValues, label: string) => {
    if (!String(values[field]).trim()) errors[field] = [`${label} مطلوب.`];
  };
  required("category", "التصنيف");
  required("title", "العنوان");
  required("description", "الوصف");
  required("duration_minutes", "المدة");
  required("date_label", "تاريخ العرض");
  const duration = Number(values.duration_minutes);
  if (!Number.isInteger(duration) || duration < 1 || duration > 1440)
    errors.duration_minutes = ["المدة يجب أن تكون بين دقيقة و١٤٤٠ دقيقة."];
  if (values.slug && !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(values.slug))
    errors.slug = ["الرابط المختصر يقبل الحروف والأرقام والشرطات فقط."];
  if (
    values.source_type === "file" &&
    !files.video &&
    !allowExistingFile &&
    !(initial?.source_type === "file" && initial.admin_file_url)
  )
    errors.video_file = ["اختر ملف فيديو للمصدر المرفوع."];
  if (values.source_type !== "file") {
    try {
      const url = new URL(values.source_link);
      if (url.protocol !== "https:") throw new Error();
    } catch {
      errors.source_link = ["أدخل رابط HTTPS صالحًا."];
    }
  }
  if (files.video && files.video.size > 200 * 1024 * 1024)
    errors.video_file = ["حجم الفيديو يتجاوز ٢٠٠ ميجابايت."];
  if (files.thumbnail && files.thumbnail.size > 10 * 1024 * 1024)
    errors.thumbnail = ["حجم الصورة يتجاوز ١٠ ميجابايت."];
  return errors;
}

export function createScientificVideoFormData(
  values: ScientificVideoFormValues,
  files: ScientificVideoFormFiles,
): FormData {
  const body = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (key === "slug" && !String(value).trim()) return;
    if (["download_allowed", "is_featured", "is_published"].includes(key))
      body.set(key, value ? "1" : "0");
    else if (key === "keywords")
      body.set(
        key,
        JSON.stringify(
          String(value)
            .split(/[,،]/u)
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      );
    else body.set(key, String(value));
  });
  if (files.video) body.set("video_file", files.video);
  if (files.thumbnail) body.set("thumbnail", files.thumbnail);
  else if (files.removeThumbnail) body.set("thumbnail", "");
  return body;
}

export function parseScientificVideoFormData(form: FormData): {
  values: ScientificVideoFormValues;
  files: ScientificVideoFormFiles;
} | null {
  const text = (key: string) =>
    typeof form.get(key) === "string" ? String(form.get(key)) : "";
  const source = text("source_type");
  if (!scientificVideoSourceTypes.includes(source as ScientificVideoSourceType))
    return null;
  const videoEntry = form.get("video_file");
  const thumbnailEntry = form.get("thumbnail");
  return {
    values: {
      slug: text("slug"),
      category: text("category"),
      title: text("title"),
      description: text("description"),
      duration_minutes: text("duration_minutes"),
      date_label: text("date_label"),
      source_type: source as ScientificVideoSourceType,
      source_link: text("source_link"),
      keywords: text("keywords"),
      download_allowed: text("download_allowed") === "1",
      is_featured: text("is_featured") === "1",
      is_published: text("is_published") === "1",
      published_at: text("published_at"),
    },
    files: {
      ...(videoEntry instanceof File && videoEntry.size
        ? { video: videoEntry }
        : {}),
      ...(thumbnailEntry instanceof File && thumbnailEntry.size
        ? { thumbnail: thumbnailEntry }
        : {}),
      ...(thumbnailEntry === "" && form.has("thumbnail")
        ? { removeThumbnail: true }
        : {}),
    },
  };
}
