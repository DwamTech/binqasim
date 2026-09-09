import type {
  Dissertation,
  DissertationFormFiles,
  DissertationFormValues,
} from "../domain/dissertations.contracts";

export const DISSERTATION_FILE_MAX_BYTES = 50 * 1024 * 1024;

export function validateDissertationForm(
  values: DissertationFormValues,
  files: DissertationFormFiles,
  initial?: Dissertation,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const required: Array<[keyof DissertationFormValues, string]> = [
    ["title", "عنوان الرسالة مطلوب."],
    ["researcher_name", "اسم الباحث مطلوب."],
    ["abstract", "ملخص الرسالة مطلوب."],
  ];
  for (const [field, message] of required) {
    if (typeof values[field] === "string" && !values[field].trim())
      errors[field] = [message];
  }
  if (
    values.slug.trim() &&
    !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(values.slug.trim())
  )
    errors.slug = ["الرابط المختصر غير صالح."];
  if (values.year.trim() && !/^\d{4}$/.test(values.year.trim()))
    errors.year = ["أدخل السنة في أربعة أرقام."];
  if (values.source_type === "file" && !files.file && !initial?.has_file)
    errors.file_path = ["اختر ملف الرسالة بصيغة PDF."];
  if (values.source_type === "link" || values.source_type === "embed") {
    try {
      const url = new URL(values.source_link);
      if (url.protocol !== "https:") throw new Error("unsafe");
    } catch {
      errors.source_link = ["أدخل رابط HTTPS صالحًا."];
    }
  }
  if (files.file) {
    if (!files.file.name.toLowerCase().endsWith(".pdf"))
      errors.file_path = ["الصيغة المسموحة هي PDF فقط."];
    else if (files.file.size > DISSERTATION_FILE_MAX_BYTES)
      errors.file_path = ["حجم الملف يجب ألا يتجاوز ٥٠MB."];
  }
  return errors;
}

export function createDissertationFormData(
  values: DissertationFormValues,
  files: DissertationFormFiles,
): FormData {
  const body = new FormData();
  for (const field of [
    "title",
    "researcher_name",
    "university",
    "college",
    "year",
    "specialization",
    "participation_type",
    "degree",
    "abstract",
    "participation_description",
  ] as const)
    body.set(field, values[field].trim());
  if (values.slug.trim()) body.set("slug", values.slug.trim());
  body.set(
    "source_type",
    values.source_type === "none" ? "" : values.source_type,
  );
  if (values.source_type === "link" || values.source_type === "embed")
    body.set("source_link", values.source_link.trim());
  for (const keyword of values.keywords
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean))
    body.append("keywords[]", keyword);
  body.set("is_published", values.is_published ? "1" : "0");
  if (values.published_at)
    body.set("published_at", values.published_at.replace("T", " "));
  if (files.file) body.set("file_path", files.file);
  return body;
}
