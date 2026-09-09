import type {
  ListeningSeries,
  ListeningSeriesFormFiles,
  ListeningSeriesFormValues,
  ListeningSession,
  ListeningSessionFormFiles,
  ListeningSessionFormValues,
} from "../domain/listening.contracts";

export const LISTENING_BOOK_MAX_BYTES = 50 * 1024 * 1024;
export const LISTENING_AUDIO_MAX_BYTES = 100 * 1024 * 1024;

const slugPattern = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;
const directAudioExtensions = new Set([
  "mp3",
  "m4a",
  "aac",
  "wav",
  "ogg",
  "oga",
  "opus",
  "webm",
]);

function secureUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

function directAudioUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.username !== "" ||
      url.password !== "" ||
      url.hash !== "" ||
      url.hostname === "localhost" ||
      url.hostname.endsWith(".local")
    ) {
      return false;
    }

    const extension = decodeURIComponent(url.pathname)
      .split(".")
      .pop()
      ?.toLowerCase();
    return Boolean(extension && directAudioExtensions.has(extension));
  } catch {
    return false;
  }
}

export function validateListeningSeriesForm(
  values: ListeningSeriesFormValues,
  files: ListeningSeriesFormFiles,
  initial?: ListeningSeries,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const required: Array<[keyof ListeningSeriesFormValues, string]> = [
    ["title", "عنوان السلسلة مطلوب."],
    ["short_title", "العنوان المختصر مطلوب."],
    ["category", "التصنيف مطلوب."],
    ["period_label", "الفترة أو السنة مطلوبة."],
    ["description", "وصف السلسلة مطلوب."],
  ];
  for (const [field, message] of required) {
    if (typeof values[field] === "string" && !values[field].trim()) {
      errors[field] = [message];
    }
  }
  if (values.slug.trim() && !slugPattern.test(values.slug.trim())) {
    errors.slug = ["استخدم حروفًا أو أرقامًا وشرطات فقط دون مسافات."];
  }
  if (
    values.book_source_type === "file" &&
    !files.book_file &&
    initial?.book_source_type !== "file"
  ) {
    errors.book_file = ["اختر ملف الكتاب بصيغة PDF."];
  }
  if (
    values.book_source_type === "link" &&
    !secureUrl(values.book_source_link)
  ) {
    errors.book_source_link = ["أدخل رابط HTTP أو HTTPS صالحًا."];
  }
  if (values.book_source_type === "file" && files.book_file) {
    if (!files.book_file.name.toLowerCase().endsWith(".pdf")) {
      errors.book_file = ["الصيغة المسموحة لملف الكتاب هي PDF فقط."];
    } else if (files.book_file.size > LISTENING_BOOK_MAX_BYTES) {
      errors.book_file = ["حجم ملف الكتاب يجب ألا يتجاوز ٥٠MB."];
    }
  }
  return errors;
}

export function validateListeningSessionForm(
  values: ListeningSessionFormValues,
  files: ListeningSessionFormFiles,
  initial?: ListeningSession,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const required: Array<[keyof ListeningSessionFormValues, string]> = [
    ["listening_series_id", "اختر السلسلة التابعة لها الجلسة."],
    ["title", "عنوان الجلسة مطلوب."],
    ["sequence_number", "ترتيب الجلسة مطلوب."],
    ["date_label", "تاريخ الجلسة مطلوب."],
    ["duration_minutes", "مدة الجلسة مطلوبة."],
    ["description", "وصف الجلسة مطلوب."],
  ];
  for (const [field, message] of required) {
    if (typeof values[field] === "string" && !values[field].trim()) {
      errors[field] = [message];
    }
  }
  if (values.slug.trim() && !slugPattern.test(values.slug.trim())) {
    errors.slug = ["استخدم حروفًا أو أرقامًا وشرطات فقط دون مسافات."];
  }
  const sequence = Number(values.sequence_number);
  if (!Number.isInteger(sequence) || sequence < 1) {
    errors.sequence_number = ["ترتيب الجلسة يجب أن يكون رقمًا صحيحًا موجبًا."];
  }
  const duration = Number(values.duration_minutes);
  if (!Number.isInteger(duration) || duration < 1) {
    errors.duration_minutes = ["المدة يجب أن تكون عدد دقائق صحيحًا موجبًا."];
  }
  if (
    values.audio_source_type === "file" &&
    !files.audio_file &&
    initial?.audio_source_type !== "file"
  ) {
    errors.audio_file = ["اختر ملف التسجيل الصوتي."];
  }
  if (
    values.audio_source_type === "link" &&
    !directAudioUrl(values.audio_source_link)
  ) {
    errors.audio_source_link = [
      "أدخل رابط HTTPS مباشرًا ينتهي بامتداد صوتي مدعوم، وليس رابط صفحة أو مشاركة.",
    ];
  }
  if (values.audio_source_type === "file" && files.audio_file) {
    const extension = files.audio_file.name.split(".").pop()?.toLowerCase();
    if (
      !extension ||
      !["mp3", "m4a", "aac", "wav", "ogg", "oga", "opus", "webm"].includes(
        extension,
      )
    ) {
      errors.audio_file = [
        "الصيغ المسموحة: MP3 أو M4A أو AAC أو WAV أو OGG أو OPUS أو WEBM.",
      ];
    } else if (files.audio_file.size > LISTENING_AUDIO_MAX_BYTES) {
      errors.audio_file = ["حجم التسجيل يجب ألا يتجاوز ١٠٠MB."];
    }
  }
  if (values.is_published && values.audio_source_type === "none") {
    errors.audio_source_type = ["أضف مصدرًا صوتيًا قبل نشر المجلس."];
  }
  return errors;
}

function setPublication(
  body: FormData,
  isPublished: boolean,
  publishedAt: string,
) {
  body.set("is_published", isPublished ? "1" : "0");
  if (isPublished) {
    body.set("published_at", publishedAt.replace("T", " "));
  }
}

export function createListeningSeriesFormData(
  values: ListeningSeriesFormValues,
  files: ListeningSeriesFormFiles,
): FormData {
  const body = new FormData();
  for (const field of [
    "slug",
    "title",
    "short_title",
    "category",
    "description",
    "period_label",
  ] as const) {
    body.set(field, values[field].trim());
  }
  body.set(
    "visual_variant",
    values.visual_variant === "none" ? "gold" : values.visual_variant,
  );
  body.set(
    "book_source_type",
    values.book_source_type === "none" ? "" : values.book_source_type,
  );
  if (values.book_source_type === "link") {
    body.set("book_source_link", values.book_source_link.trim());
  }
  body.set(
    "book_download_allowed",
    values.book_source_type !== "none" && values.book_download_allowed
      ? "1"
      : "0",
  );
  setPublication(body, values.is_published, values.published_at);
  if (values.book_source_type === "file" && files.book_file) {
    body.set("book_file", files.book_file);
  }
  return body;
}

export function createListeningSessionFormData(
  values: ListeningSessionFormValues,
  files: ListeningSessionFormFiles,
): FormData {
  const body = new FormData();
  for (const field of [
    "listening_series_id",
    "slug",
    "sequence_number",
    "title",
    "date_label",
    "duration_minutes",
    "description",
  ] as const) {
    body.set(field, values[field].trim());
  }
  body.set(
    "audio_source_type",
    values.audio_source_type === "none" ? "" : values.audio_source_type,
  );
  if (values.audio_source_type === "link") {
    body.set("audio_source_link", values.audio_source_link.trim());
  }
  body.set(
    "audio_download_allowed",
    values.audio_source_type !== "none" && values.audio_download_allowed
      ? "1"
      : "0",
  );
  setPublication(body, values.is_published, values.published_at);
  if (values.audio_source_type === "file" && files.audio_file) {
    body.set("audio_file", files.audio_file);
  }
  return body;
}
