import type { CreateVisualInput, VisualType } from "./visuals.contracts";

export const maxVideoBytes = 200 * 1024 * 1024;
export const maxThumbnailBytes = 10 * 1024 * 1024;

const videoExtensions = [
  "mp4",
  "m4v",
  "mov",
  "webm",
  "avi",
  "mkv",
  "ogv",
  "3gp",
];
const imageExtensions = ["jpg", "jpeg", "png", "webp", "avif"];
const videoMimeTypes = new Set([
  "video/mp4",
  "video/x-m4v",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",
  "video/ogg",
  "video/3gpp",
]);
const imageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export type VisualValidationResult = {
  valid: boolean;
  fieldErrors: Record<string, string[]>;
};

export function isVisualType(value: string): value is VisualType {
  return value === "upload" || value === "link";
}

export function hasUploadedFile(
  value: FormDataEntryValue | null,
): value is File {
  return (
    typeof value !== "string" &&
    value !== null &&
    typeof value.name === "string" &&
    value.name.trim() !== "" &&
    value.size > 0
  );
}

function extension(file: File): string {
  return file.name.split(".").at(-1)?.toLowerCase() ?? "";
}

function hasAllowedType(file: File, mimes: Set<string>, extensions: string[]) {
  const mime = file.type.toLowerCase();
  return (
    extensions.includes(extension(file)) && (mime === "" || mimes.has(mime))
  );
}

function addError(
  errors: Record<string, string[]>,
  field: string,
  message: string,
) {
  errors[field] ??= [];
  errors[field].push(message);
}

export function validateVisualInput(
  input: CreateVisualInput,
  mode: "create" | "update",
): VisualValidationResult {
  const errors: Record<string, string[]> = {};
  if (input.title.trim() === "") addError(errors, "title", "العنوان مطلوب.");
  if (input.title.trim().length > 255)
    addError(errors, "title", "العنوان يجب ألا يتجاوز ٢٥٥ حرفًا.");

  if (input.type === "upload") {
    if (mode === "create" && input.file === undefined)
      addError(errors, "file", "ملف الفيديو مطلوب.");
    if (input.url !== undefined && input.url.trim() !== "")
      addError(errors, "url", "لا يمكن إرسال رابط مع ملف فيديو.");
  } else {
    if (input.file !== undefined)
      addError(errors, "file", "لا يمكن إرسال ملف مع رابط خارجي.");
    if (input.url === undefined || input.url.trim() === "")
      addError(errors, "url", "رابط المرئية مطلوب.");
    else if (!/^https?:\/\//i.test(input.url.trim()))
      addError(errors, "url", "استخدم رابطًا يبدأ بـ http أو https.");
  }

  if (input.file !== undefined) {
    if (!hasAllowedType(input.file, videoMimeTypes, videoExtensions))
      addError(errors, "file", "نوع ملف الفيديو غير مدعوم.");
    if (input.file.size > maxVideoBytes)
      addError(errors, "file", "حجم الفيديو يتجاوز ٢٠٠MB.");
  }
  if (input.thumbnail !== undefined) {
    if (!hasAllowedType(input.thumbnail, imageMimeTypes, imageExtensions))
      addError(errors, "thumbnail", "نوع الصورة المصغرة غير مدعوم.");
    if (input.thumbnail.size > maxThumbnailBytes)
      addError(errors, "thumbnail", "حجم الصورة المصغرة يتجاوز ١٠MB.");
  }
  if (input.rating !== undefined && (input.rating < 0 || input.rating > 5))
    addError(errors, "rating", "التقييم يجب أن يكون بين ٠ و٥.");

  return { valid: Object.keys(errors).length === 0, fieldErrors: errors };
}

export function parseVisualFormData(
  formData: FormData,
  mode: "create" | "update" = "create",
): {
  input?: CreateVisualInput;
  fieldErrors?: Record<string, string[]>;
} {
  const getText = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };
  const type = getText("type");
  if (!isVisualType(type))
    return { fieldErrors: { type: ["نوع المرئية غير صالح."] } };
  const sectionValue = getText("section_id");
  const ratingValue = getText("rating");
  const sectionId = sectionValue === "" ? undefined : Number(sectionValue);
  const rating = ratingValue === "" ? undefined : Number(ratingValue);
  if (
    sectionValue !== "" &&
    (sectionId === undefined || !Number.isInteger(sectionId) || sectionId <= 0)
  )
    return { fieldErrors: { section_id: ["القسم المحدد غير صالح."] } };
  if (ratingValue !== "" && (rating === undefined || !Number.isFinite(rating)))
    return { fieldErrors: { rating: ["التقييم يجب أن يكون رقمًا بين ٠ و٥."] } };
  const validSectionId =
    sectionId !== undefined && Number.isInteger(sectionId) && sectionId > 0
      ? sectionId
      : undefined;
  const fileValue = formData.get("file");
  const thumbnailValue = formData.get("thumbnail");
  const input: CreateVisualInput = {
    title: getText("title"),
    type,
    ...(getText("description") === ""
      ? {}
      : { description: getText("description") }),
    ...(getText("url") === "" ? {} : { url: getText("url") }),
    ...(hasUploadedFile(fileValue) ? { file: fileValue } : {}),
    ...(hasUploadedFile(thumbnailValue) ? { thumbnail: thumbnailValue } : {}),
    ...(validSectionId !== undefined ? { section_id: validSectionId } : {}),
    ...(getText("keywords") === "" ? {} : { keywords: getText("keywords") }),
    ...(Number.isFinite(rating) ? { rating } : {}),
  };
  const validation = validateVisualInput(input, mode);
  return validation.valid ? { input } : { fieldErrors: validation.fieldErrors };
}
