import type {
  AdminBookDetail,
  BookFormFiles,
  BookFormValues,
} from "../domain/books.contracts";

export const BOOK_FILE_MAX_BYTES = 50 * 1024 * 1024;
export const BOOK_COVER_MAX_BYTES = 10 * 1024 * 1024;

const bookFileExtensions = ["pdf", "doc", "docx", "epub"];
const coverExtensions = ["jpg", "jpeg", "png", "webp", "avif"];

function extension(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

export function bookValuesFromDetail(book: AdminBookDetail): BookFormValues {
  return {
    title: book.title,
    description: book.description,
    source_type: book.source_type,
    source_link: book.source_link ?? "",
    cover_type: book.cover_type,
    keywords: book.keywords?.join(", ") ?? "",
    author_name: book.author_name,
    type: book.type,
    book_series_id:
      book.book_series_id === null ? "" : String(book.book_series_id),
    section_id: book.section_id === null ? "" : String(book.section_id),
    slug: book.slug ?? "",
    short_title: book.short_title ?? "",
    pages_count:
      book.pages_count === null || book.pages_count === undefined
        ? ""
        : String(book.pages_count),
    edition: book.edition ?? "",
    publication_info: book.publication_info ?? "",
    download_allowed: book.download_allowed ?? false,
    is_published: book.is_published ?? false,
    published_at: book.published_at?.slice(0, 16) ?? "",
  };
}

export function validateBookForm(
  values: BookFormValues,
  files: BookFormFiles,
  initial?: AdminBookDetail,
  includePublicMetadata = false,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (!values.title.trim()) errors.title = ["عنوان الكتاب مطلوب."];
  if (!values.description.trim()) errors.description = ["وصف الكتاب مطلوب."];
  if (!values.author_name.trim()) errors.author_name = ["اسم المؤلف مطلوب."];
  if (
    values.source_type === "file" &&
    !files.file &&
    initial?.source_type !== "file"
  )
    errors.file_path = ["اختر ملف الكتاب."];
  if (
    (values.source_type === "link" || values.source_type === "embed") &&
    !values.source_link.trim()
  )
    errors.source_link = ["رابط المصدر مطلوب."];
  if (
    values.cover_type === "upload" &&
    !files.cover &&
    initial?.cover_type !== "upload"
  )
    errors.cover_path = ["اختر صورة الغلاف."];
  if (values.type === "part" && !values.book_series_id)
    errors.book_series_id = ["اختر سلسلة الكتاب."];
  if (includePublicMetadata) {
    if (
      values.slug.trim() &&
      !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(values.slug.trim())
    )
      errors.slug = ["الرابط المختصر غير صالح."];
    const pages = Number(values.pages_count);
    if (!values.pages_count.trim() || !Number.isInteger(pages) || pages < 1)
      errors.pages_count = ["أدخل عدد صفحات صحيحًا أكبر من صفر."];
    if (!values.edition.trim()) errors.edition = ["بيانات الطبعة مطلوبة."];
  }

  if (files.file) {
    if (!bookFileExtensions.includes(extension(files.file)))
      errors.file_path = ["الصيغ المسموحة: PDF وDOC وDOCX وEPUB."];
    else if (files.file.size > BOOK_FILE_MAX_BYTES)
      errors.file_path = ["حجم ملف الكتاب يجب ألا يتجاوز ٥٠MB."];
  }
  if (files.cover) {
    if (!coverExtensions.includes(extension(files.cover)))
      errors.cover_path = ["الصيغ المسموحة: JPG وPNG وWebP وAVIF."];
    else if (files.cover.size > BOOK_COVER_MAX_BYTES)
      errors.cover_path = ["حجم الغلاف يجب ألا يتجاوز ١٠MB."];
  }
  return errors;
}

export function createBookFormData(
  values: BookFormValues,
  files: BookFormFiles,
  includePublicMetadata = false,
): FormData {
  const body = new FormData();
  body.set("title", values.title.trim());
  body.set("description", values.description.trim());
  body.set("source_type", values.source_type);
  body.set("cover_type", "auto");
  body.set("author_name", values.author_name.trim());
  body.set("type", values.type);

  if (values.source_type !== "file" && values.source_link.trim())
    body.set("source_link", values.source_link.trim());
  if (values.section_id) body.set("section_id", values.section_id);
  if (values.type === "part" && values.book_series_id)
    body.set("book_series_id", values.book_series_id);
  for (const keyword of values.keywords
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean))
    body.append("keywords[]", keyword);
  if (files.file) body.set("file_path", files.file);
  if (includePublicMetadata) {
    if (values.slug.trim()) body.set("slug", values.slug.trim());
    if (values.short_title.trim())
      body.set("short_title", values.short_title.trim());
    body.set("pages_count", values.pages_count.trim());
    body.set("edition", values.edition.trim());
    if (values.publication_info.trim())
      body.set("publication_info", values.publication_info.trim());
    body.set("download_allowed", values.download_allowed ? "1" : "0");
    body.set("is_published", values.is_published ? "1" : "0");
    if (values.published_at)
      body.set("published_at", values.published_at.replace("T", " "));
  }
  return body;
}
