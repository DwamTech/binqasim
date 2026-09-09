import type { ArticleFormFiles, ArticleFormValues } from "./articles.contracts";

export const ARTICLE_MAX_FILE_BYTES = 2 * 1024 * 1024;
export const ARTICLE_MAX_IMAGE_BYTES = 150 * 1024 * 1024;
export const ARTICLE_MAX_VIDEO_BYTES = 200 * 1024 * 1024;

const allowed = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  audio: [
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/mp4",
    "audio/aac",
    "audio/x-m4a",
  ],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/zip",
    "application/x-rar-compressed",
  ],
  video: [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/webm",
  ],
} as const;

export type MediaKind = keyof typeof allowed;

export function validateMediaFile(file: File, kind: MediaKind): string | null {
  const maximumBytes =
    kind === "image"
      ? ARTICLE_MAX_IMAGE_BYTES
      : kind === "video"
        ? ARTICLE_MAX_VIDEO_BYTES
        : ARTICLE_MAX_FILE_BYTES;
  if (file.size > maximumBytes)
    return `الملف «${file.name}» أكبر من ${
      kind === "image" ? "١٥٠MB" : kind === "video" ? "٢٠٠MB" : "٢MB"
    }.`;
  if (!(allowed[kind] as readonly string[]).includes(file.type))
    return `نوع الملف «${file.name}» غير مسموح.`;
  return null;
}

export function allArticleFiles(files: ArticleFormFiles): File[] {
  return [
    ...(files.featuredImage ? [files.featuredImage] : []),
    ...files.galleryImages,
    ...(files.audioFiles ?? []),
    ...(files.documents ?? []),
    ...(files.videos ?? []),
  ];
}

export function validateArticleFiles(
  files: ArticleFormFiles,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  const validateFiles = (field: string, items: File[], kind: MediaKind) => {
    items.forEach((file) => {
      const error = validateMediaFile(file, kind);
      if (error) errors[field] = [...(errors[field] ?? []), error];
    });
  };
  if (files.featuredImage) {
    const file = files.featuredImage;
    const error = validateMediaFile(file, "image");
    if (error) errors.featured_image = [error];
  }
  validateFiles("gallery_images", files.galleryImages, "image");
  validateFiles("audio_files", files.audioFiles ?? [], "audio");
  validateFiles("documents", files.documents ?? [], "document");
  validateFiles("videos", files.videos ?? [], "video");

  return errors;
}

export function validateArticleValues(
  values: ArticleFormValues,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (!values.title.trim()) errors.title = ["عنوان المقال مطلوب."];
  else if (values.title.trim().length > 255)
    errors.title = ["العنوان لا يمكن أن يتجاوز ٢٥٥ حرفًا."];
  if (values.slug.trim().length > 255)
    errors.slug = ["Slug لا يمكن أن يتجاوز ٢٥٥ حرفًا."];
  const visibleContent = values.content
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim();
  if (!visibleContent) errors.content = ["محتوى المقال مطلوب."];
  return errors;
}

export function createArticleFormData(
  values: ArticleFormValues,
  files: ArticleFormFiles,
): FormData {
  const form = new FormData();
  const scalarEntries: [string, string][] = [
    ["title", values.title.trim()],
    ["slug", values.slug.trim()],
    ["content", values.content],
    ["status", values.status],
    ["section_id", values.section_id],
    ["excerpt", values.excerpt],
    ["author_name", values.author_name],
    ["published_at", values.published_at],
    ["duration", values.duration],
    ["location", values.location],
    ["references", values.references],
    ["keywords", values.keywords],
  ];
  scalarEntries.forEach(([key, value]) => {
    if (value !== "") form.set(key, value);
  });
  if (files.featuredImage) form.set("featured_image", files.featuredImage);
  files.galleryImages.forEach((file) => form.append("gallery_images[]", file));
  (files.audioFiles ?? []).forEach((file) =>
    form.append("audio_files[]", file),
  );
  (files.documents ?? []).forEach((file) => form.append("documents[]", file));
  (files.videos ?? []).forEach((file) => form.append("videos[]", file));
  return form;
}

export function slugSuggestion(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
