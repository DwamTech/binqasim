"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

import { Alert, Button, Card, Select } from "@/shared/components/ui";
import {
  formatArabicFileSize,
  formatArabicNumber,
} from "@/shared/lib/arabic-format";
import { createBook, updateBook } from "../application/books.client";
import {
  bookValuesFromDetail,
  validateBookForm,
} from "../application/books.form";
import type {
  AdminBookDetail,
  BookCatalogs,
  BookFormFiles,
  BookFormValues,
} from "../domain/books.contracts";
import { emptyBookForm } from "../domain/books.contracts";
import styles from "./books.module.css";
import type { LibraryAreaSlug } from "../domain/library-areas";

function SectionTitle({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.sectionTitle}>
      <span>{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  wide,
  children,
}: {
  label: string;
  error?: string[] | undefined;
  hint?: string | undefined;
  wide?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <label className={wide ? styles.wideField : undefined}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
      {error?.[0] && <em role="alert">{error[0]}</em>}
    </label>
  );
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className={styles.filePreview}>
      <span aria-hidden="true">DOC</span>
      <div>
        <strong>{file.name}</strong>
        <small>{formatArabicFileSize(file.size)}</small>
      </div>
      <button type="button" onClick={onRemove} aria-label="إزالة الملف">
        ×
      </button>
    </div>
  );
}

export function BookForm({
  catalogs,
  initial,
  area,
  basePath = "/dashboard/books",
  publicMetadataFields = false,
}: {
  catalogs: BookCatalogs;
  initial?: AdminBookDetail;
  area?: LibraryAreaSlug;
  basePath?: string;
  publicMetadataFields?: boolean;
}) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [values, setValues] = useState<BookFormValues>(
    initial
      ? { ...bookValuesFromDetail(initial), cover_type: "auto" }
      : emptyBookForm,
  );
  const [files, setFiles] = useState<BookFormFiles>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const currentSectionInactive =
    initial?.section_id &&
    !catalogs.sections.some(
      (section) => section.id === String(initial.section_id),
    );

  function setField<K extends keyof BookFormValues>(
    field: K,
    value: BookFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validateBookForm(
      values,
      files,
      initial,
      publicMetadataFields,
    );
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setGlobalError("راجع الحقول والملفات المحددة.");
      return;
    }
    setSubmitting(true);
    setErrors({});
    setGlobalError(null);
    try {
      const result = initial
        ? await updateBook(
            String(initial.id),
            values,
            files,
            area,
            publicMetadataFields,
          )
        : await createBook(values, files, area, publicMetadataFields);
      router.replace(
        `${basePath}/${result.data.id}?notice=${editing ? "updated" : "created"}`,
      );
      router.refresh();
    } catch (reason) {
      if (reason && typeof reason === "object" && "fieldErrors" in reason) {
        const fieldErrors = (
          reason as { fieldErrors?: Record<string, string[]> }
        ).fieldErrors;
        if (fieldErrors) setErrors(fieldErrors);
      }
      setGlobalError(
        reason instanceof Error ? reason.message : "تعذر حفظ الكتاب.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className={styles.form}
      dir="rtl"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      {globalError && (
        <Alert variant="error" title="تعذر حفظ الكتاب">
          {globalError}
        </Alert>
      )}
      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠١"
          title="بيانات الكتاب"
          description="المعلومات الأساسية التي تساعد القارئ على فهم المحتوى."
        />
        <div className={styles.formGrid}>
          <Field label="عنوان الكتاب *" error={errors.title} wide>
            <input
              className="ui-input"
              value={values.title}
              maxLength={255}
              onChange={(event) => setField("title", event.target.value)}
            />
          </Field>
          <Field label="اسم المؤلف *" error={errors.author_name}>
            <>
              <input
                className="ui-input"
                list="book-authors"
                value={values.author_name}
                maxLength={255}
                onChange={(event) =>
                  setField("author_name", event.target.value)
                }
              />
              <datalist id="book-authors">
                {catalogs.authors.map((author) => (
                  <option key={author} value={author} />
                ))}
              </datalist>
            </>
          </Field>
          <Field label="القسم" error={errors.section_id}>
            <Select
              value={values.section_id}
              aria-label="قسم الكتاب"
              options={[
                { value: "", label: "بدون قسم" },
                ...(currentSectionInactive && initial?.section_id
                  ? [
                      {
                        value: String(initial.section_id),
                        label: `${initial.section?.name ?? "القسم الحالي"} — غير نشط`,
                      },
                    ]
                  : []),
                ...catalogs.sections.map((section) => ({
                  value: String(section.id),
                  label: section.name,
                })),
              ]}
              onValueChange={(value) => setField("section_id", value)}
            />
          </Field>
          <Field
            label="وصف الكتاب *"
            error={errors.description}
            hint={`${formatArabicNumber(values.description.length)} حرف`}
            wide
          >
            <textarea
              className="ui-textarea"
              rows={7}
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </Field>
          <Field
            label="الكلمات المفتاحية"
            hint="افصل الكلمات بفاصلة، مثال: تاريخ، مكتبة، حضارة"
            wide
          >
            <input
              className="ui-input"
              value={values.keywords}
              onChange={(event) => setField("keywords", event.target.value)}
            />
          </Field>
        </div>
      </Card>

      {publicMetadataFields && (
        <Card className={styles.formCard ?? ""}>
          <SectionTitle
            number="٠٢"
            title="بيانات العرض العام"
            description="الحقول التي تظهر في كرت الكتاب وصفحة القراءة بالموقع."
          />
          <div className={styles.formGrid}>
            <Field label="العنوان المختصر" error={errors.short_title}>
              <input
                className="ui-input"
                value={values.short_title}
                maxLength={120}
                onChange={(event) =>
                  setField("short_title", event.target.value)
                }
              />
            </Field>
            <Field label="عدد الصفحات *" error={errors.pages_count}>
              <input
                className="ui-input"
                type="number"
                inputMode="numeric"
                min={1}
                value={values.pages_count}
                onChange={(event) =>
                  setField("pages_count", event.target.value)
                }
              />
            </Field>
            <Field label="بيانات الطبعة *" error={errors.edition}>
              <input
                className="ui-input"
                value={values.edition}
                maxLength={160}
                placeholder="الطبعة الأولى — ١٤٤٦هـ"
                onChange={(event) => setField("edition", event.target.value)}
              />
            </Field>
            <Field label="معلومات النشر" error={errors.publication_info} wide>
              <textarea
                className="ui-textarea"
                rows={3}
                value={values.publication_info}
                maxLength={1000}
                onChange={(event) =>
                  setField("publication_info", event.target.value)
                }
              />
            </Field>
            <Field label="تاريخ النشر" error={errors.published_at}>
              <input
                className="ui-input"
                type="datetime-local"
                value={values.published_at}
                onChange={(event) =>
                  setField("published_at", event.target.value)
                }
              />
            </Field>
            <div className={styles.choiceGrid}>
              <label className={styles.choiceCard}>
                <input
                  type="checkbox"
                  checked={values.download_allowed}
                  onChange={(event) =>
                    setField("download_allowed", event.target.checked)
                  }
                />
                <strong>السماح بالتحميل</strong>
                <small>إظهار زر التحميل عندما يكون للكتاب ملف صالح.</small>
              </label>
              <label className={styles.choiceCard}>
                <input
                  type="checkbox"
                  checked={values.is_published}
                  onChange={(event) =>
                    setField("is_published", event.target.checked)
                  }
                />
                <strong>منشور للعامة</strong>
                <small>لن يظهر الكتاب في الواجهة العامة قبل التفعيل.</small>
              </label>
            </div>
          </div>
        </Card>
      )}

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number={publicMetadataFields ? "٠٣" : "٠٢"}
          title="التصنيف والسلسلة"
          description="حدد هل الكتاب مستقل أم جزء من سلسلة مترابطة."
        />
        <div className={styles.choiceGrid}>
          {(["single", "part"] as const).map((type) => (
            <label
              key={type}
              className={`${styles.choiceCard} ${values.type === type ? styles.choiceCardActive : ""}`}
            >
              <input
                type="radio"
                name="book-type"
                checked={values.type === type}
                onChange={() => {
                  setField("type", type);
                  if (type === "single") setField("book_series_id", "");
                }}
              />
              <strong>
                {type === "single" ? "كتاب مستقل" : "جزء من سلسلة"}
              </strong>
              <small>
                {type === "single"
                  ? "كتاب منفرد لا يرتبط بأجزاء أخرى."
                  : "كتاب مرتبط بسلسلة موجودة."}
              </small>
            </label>
          ))}
        </div>
        {values.type === "part" && (
          <div className={styles.formGrid}>
            <Field label="السلسلة *" error={errors.book_series_id}>
              <Select
                value={values.book_series_id}
                aria-label="سلسلة الكتاب"
                options={[
                  { value: "", label: "اختر السلسلة" },
                  ...catalogs.series.map((series) => ({
                    value: String(series.id),
                    label: series.name,
                  })),
                ]}
                onValueChange={(value) => setField("book_series_id", value)}
              />
            </Field>
            <div className={styles.inlineHelp}>
              <span>لم تجد السلسلة؟</span>
              <Link href="/dashboard/books/series">إدارة السلاسل</Link>
            </div>
          </div>
        )}
      </Card>

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number={publicMetadataFields ? "٠٤" : "٠٣"}
          title="مصدر الكتاب"
          description="ارفع الملف أو اربط الكتاب بمصدر خارجي آمن."
        />
        {editing && initial?.source_type !== values.source_type && (
          <Alert title="تم تغيير نوع المصدر">
            Backend الحالي لا يحذف ملف المصدر القديم تلقائيًا. سيتم حفظ المصدر
            الجديد، وتحتاج عملية تنظيف الملفات القديمة إلى إغلاق مستقل.
          </Alert>
        )}
        <div className={styles.choiceGrid}>
          {(["file", "link", "embed"] as const).map((source) => (
            <label
              key={source}
              className={`${styles.choiceCard} ${values.source_type === source ? styles.choiceCardActive : ""}`}
            >
              <input
                type="radio"
                name="source-type"
                checked={values.source_type === source}
                onChange={() => setField("source_type", source)}
              />
              <strong>
                {source === "file"
                  ? "ملف كتاب"
                  : source === "link"
                    ? "رابط خارجي"
                    : "رابط تضمين"}
              </strong>
              <small>
                {source === "file"
                  ? "PDF أو DOC أو DOCX أو EPUB."
                  : "يُفتح كرابط آمن دون حقن HTML."}
              </small>
            </label>
          ))}
        </div>
        {values.source_type === "file" ? (
          <div className={styles.uploadBox}>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.epub"
              onChange={(event) =>
                setFiles((current) => ({
                  ...current,
                  file: event.target.files?.[0],
                }))
              }
            />
            <strong>
              {editing ? "استبدال ملف الكتاب" : "اختر ملف الكتاب"}
            </strong>
            <small>الحد الأقصى ٥٠MB.</small>
            {files.file && (
              <FilePreview
                file={files.file}
                onRemove={() =>
                  setFiles((current) => ({ ...current, file: undefined }))
                }
              />
            )}
            {errors.file_path?.[0] && (
              <em role="alert">{errors.file_path[0]}</em>
            )}
          </div>
        ) : (
          <Field
            label={
              values.source_type === "embed"
                ? "رابط التضمين *"
                : "رابط الكتاب *"
            }
            error={errors.source_link}
            hint="استخدم رابط HTTPS. لن يتم حقن HTML أو iframe خام."
            wide
          >
            <input
              className="ui-input"
              type="url"
              dir="ltr"
              value={values.source_link}
              placeholder="https://"
              onChange={(event) => setField("source_link", event.target.value)}
            />
          </Field>
        )}
      </Card>

      {catalogs.sectionsWarning && (
        <Alert title="تنبيه الأقسام">{catalogs.sectionsWarning}</Alert>
      )}
      <div className={styles.stickyActions}>
        <Link
          href={initial ? `${basePath}/${initial.id}` : basePath}
          className="ui-button ui-button--secondary ui-focus"
        >
          إلغاء
        </Link>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitting
            ? "جارٍ الرفع والحفظ..."
            : editing
              ? "حفظ التعديلات"
              : "إضافة الكتاب"}
        </Button>
      </div>
    </form>
  );
}
