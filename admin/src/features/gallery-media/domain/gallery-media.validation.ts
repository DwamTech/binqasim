import type { GalleryMediaFileValidationError } from "./gallery-media.contracts";

export const galleryMediaMaxBytes = 200 * 1024 * 1024;
export const galleryMediaRequestLimitBytes = 225 * 1024 * 1024;

const imageMimes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/bmp",
  "image/heic",
  "image/heif",
]);
const videoMimes = new Set([
  "video/mp4",
  "video/x-m4v",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",
  "video/ogg",
  "video/3gpp",
]);
const imageExtensions = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "bmp",
  "heic",
  "heif",
]);
const videoExtensions = new Set([
  "mp4",
  "m4v",
  "mov",
  "webm",
  "avi",
  "mkv",
  "ogv",
  "3gp",
]);

function extension(file: File) {
  return file.name.split(".").at(-1)?.toLowerCase() ?? "";
}
function add(
  errors: GalleryMediaFileValidationError,
  key: string,
  message: string,
) {
  (errors[key] ??= []).push(message);
}

export function validateGalleryMediaFile(file: File): string | undefined {
  if (file.size === 0) return "الملف فارغ ولا يمكن رفعه.";
  if (file.size > galleryMediaMaxBytes)
    return "حجم الملف يتجاوز الحد المسموح ٢٠٠MB.";
  const validExtension =
    imageExtensions.has(extension(file)) ||
    videoExtensions.has(extension(file));
  const validMime =
    file.type === "" ||
    imageMimes.has(file.type.toLowerCase()) ||
    videoMimes.has(file.type.toLowerCase());
  return validExtension && validMime ? undefined : "نوع الملف غير مدعوم.";
}

export function validateGalleryMediaFiles(
  files: readonly File[],
): GalleryMediaFileValidationError {
  const errors: GalleryMediaFileValidationError = {};
  if (files.length === 0)
    add(errors, "files", "يرجى اختيار ملف واحد على الأقل.");
  const seen = new Set<string>();
  files.forEach((file, index) => {
    const key = `${file.name}:${file.size}:${file.lastModified}`;
    if (seen.has(key))
      add(errors, `files.${index}`, "تم اختيار هذا الملف مسبقًا.");
    seen.add(key);
    const error = validateGalleryMediaFile(file);
    if (error !== undefined) add(errors, `files.${index}`, error);
  });
  return errors;
}

export function isGalleryMediaType(value: string): value is "image" | "video" {
  return value === "image" || value === "video";
}
