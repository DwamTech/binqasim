import type {
  ScientificLibraryFormFiles,
  ScientificLibraryFormValues,
  ScientificLibraryItem,
} from "../domain/scientific-library.contracts";

export const SCIENTIFIC_LIBRARY_FILE_MAX_BYTES = 50 * 1024 * 1024;
export const SCIENTIFIC_LIBRARY_COVER_MAX_BYTES = 10 * 1024 * 1024;

const documentExtensions = ["pdf"];
const coverExtensions = ["jpg", "jpeg", "png", "webp", "avif"];

function extension(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

function localDateTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function apiDateTime(value: string): string {
  if (!value.trim()) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value.replace("T", " ")
    : date.toISOString();
}

export function scientificLibraryItemToFormValues(
  item: ScientificLibraryItem,
): ScientificLibraryFormValues {
  return {
    slug: item.slug,
    title: item.title,
    short_title: item.short_title ?? "",
    author_name: item.author_name,
    description: item.description,
    content_type: item.content_type,
    scientific_field: item.scientific_field,
    pages_count: String(item.pages_count),
    edition: item.edition,
    publication_info: item.publication_info ?? "",
    source_type: item.source_type,
    source_link: item.source_link ?? "",
    keywords: item.keywords.join(", "),
    download_allowed: item.download_allowed,
    is_featured: item.is_featured,
    is_published: item.is_published,
    published_at: localDateTime(item.published_at),
  };
}

export function isSecureHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" && url.username === "" && url.password === ""
    );
  } catch {
    return false;
  }
}

export function validateScientificLibraryForm(
  values: ScientificLibraryFormValues,
  files: ScientificLibraryFormFiles,
  initial?: ScientificLibraryItem,
  allowExistingFile = false,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const required: Array<[keyof ScientificLibraryFormValues, string]> = [
    ["title", "عنوان المصنَّف مطلوب."],
    ["author_name", "اسم المؤلف مطلوب."],
    ["description", "الوصف مطلوب."],
    ["content_type", "نوع المحتوى مطلوب."],
    ["scientific_field", "المجال العلمي مطلوب."],
    ["pages_count", "عدد الصفحات مطلوب."],
    ["edition", "بيانات الإصدار مطلوبة."],
  ];
  for (const [field, message] of required) {
    const value = values[field];
    if (typeof value === "string" && !value.trim()) errors[field] = [message];
  }
  if (
    values.slug.trim() &&
    !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(values.slug.trim())
  )
    errors.slug = ["الرابط المختصر غير صالح."];
  const pages = Number(values.pages_count);
  if (!Number.isInteger(pages) || pages < 1 || pages > 100_000)
    errors.pages_count = ["أدخل عدد صفحات صحيحًا بين ١ و١٠٠٬٠٠٠."];

  const initialHasFile = Boolean(
    initial?.source_type === "file" &&
    (initial.file_path || initial.admin_file_url || initial.source_url),
  );
  if (
    values.source_type === "file" &&
    !files.file &&
    !initialHasFile &&
    !allowExistingFile
  )
    errors.file_path = ["اختر ملف المصنَّف."];
  if (values.source_type === "link" || values.source_type === "embed") {
    if (!values.source_link.trim()) errors.source_link = ["رابط المصدر مطلوب."];
    else if (!isSecureHttpUrl(values.source_link.trim()))
      errors.source_link = ["أدخل رابط HTTPS صالحًا دون بيانات دخول."];
  }
  if (values.source_type === "file" && files.file) {
    if (!documentExtensions.includes(extension(files.file)))
      errors.file_path = ["الصيغة المسموحة لملف القراءة: PDF فقط."];
    else if (files.file.size > SCIENTIFIC_LIBRARY_FILE_MAX_BYTES)
      errors.file_path = ["حجم ملف المصنَّف يجب ألا يتجاوز ٥٠MB."];
  }
  if (files.cover) {
    if (!coverExtensions.includes(extension(files.cover)))
      errors.cover_path = ["صيغ الغلاف المسموحة: JPG وPNG وWebP وAVIF."];
    else if (files.cover.size > SCIENTIFIC_LIBRARY_COVER_MAX_BYTES)
      errors.cover_path = ["حجم الغلاف يجب ألا يتجاوز ١٠MB."];
  }
  if (
    values.published_at &&
    Number.isNaN(new Date(values.published_at).getTime())
  )
    errors.published_at = ["أدخل تاريخ نشر صالحًا."];
  return errors;
}

export function createScientificLibraryFormData(
  values: ScientificLibraryFormValues,
  files: ScientificLibraryFormFiles,
): FormData {
  const body = new FormData();
  if (values.slug.trim()) body.set("slug", values.slug.trim());
  body.set("title", values.title.trim());
  body.set("short_title", values.short_title.trim());
  body.set("author_name", values.author_name.trim());
  body.set("description", values.description.trim());
  body.set("content_type", values.content_type.trim());
  body.set("scientific_field", values.scientific_field.trim());
  body.set("pages_count", values.pages_count.trim());
  body.set("edition", values.edition.trim());
  body.set("publication_info", values.publication_info.trim());
  body.set("source_type", values.source_type);
  body.set(
    "source_link",
    values.source_type === "file" ? "" : values.source_link.trim(),
  );
  body.set(
    "download_allowed",
    values.source_type !== "embed" && values.download_allowed ? "1" : "0",
  );
  body.set("is_featured", values.is_featured ? "1" : "0");
  body.set("is_published", values.is_published ? "1" : "0");
  body.set(
    "published_at",
    values.is_published ? apiDateTime(values.published_at) : "",
  );
  const keywords = values.keywords
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (keywords.length > 0) {
    for (const keyword of keywords) body.append("keywords[]", keyword);
  } else {
    // Laravel converts the empty multipart scalar to null, which explicitly
    // clears an existing nullable keywords value during PATCH.
    body.set("keywords", "");
  }
  if (values.source_type === "file" && files.file)
    body.set("file_path", files.file);
  if (files.cover) body.set("cover_path", files.cover);
  else if (files.removeCover) body.set("cover_path", "");
  return body;
}

export function readScientificLibraryFormData(body: FormData): {
  values: ScientificLibraryFormValues;
  files: ScientificLibraryFormFiles;
} | null {
  const text = (key: string) => {
    const value = body.get(key);
    return typeof value === "string" ? value : "";
  };
  const sourceType = text("source_type");
  if (sourceType !== "file" && sourceType !== "link" && sourceType !== "embed")
    return null;
  const boolean = (key: string) => text(key) === "1";
  const fileValue = body.get("file_path");
  const coverValue = body.get("cover_path");
  const files: ScientificLibraryFormFiles = {};
  if (fileValue instanceof File && fileValue.size > 0) files.file = fileValue;
  if (coverValue instanceof File && coverValue.size > 0)
    files.cover = coverValue;
  else if (coverValue === "") files.removeCover = true;
  return {
    values: {
      slug: text("slug"),
      title: text("title"),
      short_title: text("short_title"),
      author_name: text("author_name"),
      description: text("description"),
      content_type: text("content_type"),
      scientific_field: text("scientific_field"),
      pages_count: text("pages_count"),
      edition: text("edition"),
      publication_info: text("publication_info"),
      source_type: sourceType,
      source_link: text("source_link"),
      keywords: body
        .getAll("keywords[]")
        .filter((value): value is string => typeof value === "string")
        .join(", "),
      download_allowed: boolean("download_allowed"),
      is_featured: boolean("is_featured"),
      is_published: boolean("is_published"),
      published_at: text("published_at"),
    },
    files,
  };
}
