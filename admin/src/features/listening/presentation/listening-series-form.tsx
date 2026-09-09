"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert, Button, Card } from "@/shared/components/ui";
import { formatArabicFileSize } from "@/shared/lib/arabic-format";
import {
  createListeningSeries,
  updateListeningSeries,
} from "../application/listening.client";
import { validateListeningSeriesForm } from "../application/listening.form";
import {
  emptyListeningSeriesForm,
  listeningSeriesToFormValues,
  type ListeningSeries,
  type ListeningSeriesFormFiles,
  type ListeningSeriesFormValues,
} from "../domain/listening.contracts";
import { ListeningField, ListeningSectionTitle } from "./listening-form-parts";
import styles from "./listening.module.css";

const visualVariants = [
  ["none", "المظهر الافتراضي"],
  ["gold", "ذهبي"],
  ["sage", "أخضر هادئ"],
  ["clay", "طيني"],
  ["bronze", "برونزي"],
  ["slate", "أردوازي"],
] as const;

export function ListeningSeriesForm({
  initial,
  onSaved,
  onCancel,
  onDirtyChange,
  onSubmittingChange,
}: {
  initial?: ListeningSeries;
  onSaved?: (series: ListeningSeries) => void;
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSubmittingChange?: (submitting: boolean) => void;
}) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [values, setValues] = useState<ListeningSeriesFormValues>(
    initial
      ? listeningSeriesToFormValues(initial)
      : { ...emptyListeningSeriesForm },
  );
  const [files, setFiles] = useState<ListeningSeriesFormFiles>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof ListeningSeriesFormValues>(
    field: K,
    value: ListeningSeriesFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    onDirtyChange?.(true);
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validateListeningSeriesForm(values, files, initial);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setGlobalError("راجع الحقول وملف الكتاب قبل الحفظ.");
      return;
    }
    setSubmitting(true);
    onSubmittingChange?.(true);
    setErrors({});
    setGlobalError(null);
    try {
      const result = initial
        ? await updateListeningSeries(initial.id, values, files)
        : await createListeningSeries(values, files);
      if (onSaved) {
        onSaved(result.data);
        return;
      }
      router.replace(
        `/dashboard/listening/${result.data.id}?notice=${editing ? "updated" : "created"}`,
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
        reason instanceof Error ? reason.message : "تعذر حفظ السلسلة.",
      );
    } finally {
      setSubmitting(false);
      onSubmittingChange?.(false);
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
        <Alert variant="error" title="تعذر حفظ السلسلة">
          {globalError}
        </Alert>
      )}

      <Card className={styles.formCard ?? ""}>
        <ListeningSectionTitle
          number="٠١"
          title="هوية السلسلة"
          description="البيانات المستخدمة في الكرت وصفحة السلسلة والرابط العام."
        />
        <div className={styles.formGrid}>
          <ListeningField label="عنوان السلسلة *" error={errors.title} wide>
            <input
              className="ui-input"
              maxLength={255}
              value={values.title}
              onChange={(event) => setField("title", event.target.value)}
            />
          </ListeningField>
          <ListeningField label="العنوان المختصر *" error={errors.short_title}>
            <input
              className="ui-input"
              maxLength={120}
              value={values.short_title}
              onChange={(event) => setField("short_title", event.target.value)}
            />
          </ListeningField>
          <ListeningField label="التصنيف *" error={errors.category}>
            <input
              className="ui-input"
              maxLength={120}
              value={values.category}
              placeholder="كتب الصحاح"
              onChange={(event) => setField("category", event.target.value)}
            />
          </ListeningField>
          <ListeningField label="الفترة أو السنة *" error={errors.period_label}>
            <input
              className="ui-input"
              maxLength={100}
              value={values.period_label}
              placeholder="١٤٤٦هـ أو متجدد"
              onChange={(event) => setField("period_label", event.target.value)}
            />
          </ListeningField>
          <ListeningField label="المظهر البصري" error={errors.visual_variant}>
            <select
              className="ui-input"
              value={values.visual_variant}
              onChange={(event) =>
                setField(
                  "visual_variant",
                  event.target
                    .value as ListeningSeriesFormValues["visual_variant"],
                )
              }
            >
              {visualVariants.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </ListeningField>
          <ListeningField label="وصف السلسلة *" error={errors.description} wide>
            <textarea
              className="ui-textarea"
              rows={7}
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </ListeningField>
        </div>
      </Card>

      <Card className={styles.formCard ?? ""}>
        <ListeningSectionTitle
          number="٠٢"
          title="الكتاب المرتبط"
          description="اتركه فارغًا أو ارفع PDF أو أضف رابط قراءة خارجيًا."
        />
        <div className={styles.choiceGrid}>
          {(
            [
              ["none", "بدون كتاب", "يمكن استكماله لاحقًا."],
              ["file", "ملف مرفوع", "PDF على خادم الموقع."],
              ["link", "رابط خارجي", "رابط مباشر أو Google Drive."],
            ] as const
          ).map(([source, label, description]) => (
            <label
              key={source}
              className={`${styles.choiceCard} ${values.book_source_type === source ? styles.choiceCardActive : ""}`}
            >
              <input
                type="radio"
                name="book-source"
                checked={values.book_source_type === source}
                onChange={() => setField("book_source_type", source)}
              />
              <strong>{label}</strong>
              <small>{description}</small>
            </label>
          ))}
        </div>

        {values.book_source_type === "file" && (
          <div className={styles.uploadBox}>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => {
                setFiles({ book_file: event.target.files?.[0] });
                onDirtyChange?.(true);
              }}
            />
            <strong>
              {editing && initial?.book_file_path
                ? "استبدال ملف الكتاب"
                : "اختر ملف الكتاب"}
            </strong>
            <small>PDF بحد أقصى ٥٠MB.</small>
            {files.book_file && (
              <div className={styles.filePreview}>
                <div>
                  <strong>{files.book_file.name}</strong>
                  <small>{formatArabicFileSize(files.book_file.size)}</small>
                </div>
                <button
                  type="button"
                  aria-label="إزالة الملف"
                  onClick={() => {
                    setFiles({});
                    onDirtyChange?.(true);
                  }}
                >
                  ×
                </button>
              </div>
            )}
            {errors.book_file?.[0] && (
              <em role="alert">{errors.book_file[0]}</em>
            )}
          </div>
        )}

        {values.book_source_type === "link" && (
          <div className={styles.formGrid}>
            <ListeningField
              label="رابط الكتاب *"
              error={errors.book_source_link}
              hint="يجب أن يبدأ الرابط بـ HTTP أو HTTPS."
              wide
            >
              <input
                className="ui-input"
                type="url"
                dir="ltr"
                value={values.book_source_link}
                placeholder="https://"
                onChange={(event) =>
                  setField("book_source_link", event.target.value)
                }
              />
            </ListeningField>
          </div>
        )}
        {values.book_source_type !== "none" && (
          <label className={styles.inlineSwitch}>
            <input
              type="checkbox"
              checked={values.book_download_allowed}
              onChange={(event) =>
                setField("book_download_allowed", event.target.checked)
              }
            />
            <span>السماح للزائر بتحميل الكتاب</span>
          </label>
        )}
      </Card>

      <Card className={styles.formCard ?? ""}>
        <ListeningSectionTitle
          number="٠٣"
          title="النشر"
          description="السلسلة تبدأ كمسودة ولا تظهر للعامة قبل مراجعتها."
        />
        <div className={styles.formGrid}>
          <label className={styles.publicationSwitch}>
            <input
              type="checkbox"
              checked={values.is_published}
              onChange={(event) =>
                setField("is_published", event.target.checked)
              }
            />
            <span>
              <strong>منشورة للعامة</strong>
              <small>فعّل الخيار بعد اكتمال بيانات السلسلة.</small>
            </span>
          </label>
          {values.is_published && (
            <ListeningField label="تاريخ النشر" error={errors.published_at}>
              <input
                className="ui-input"
                type="datetime-local"
                value={values.published_at}
                onChange={(event) =>
                  setField("published_at", event.target.value)
                }
              />
            </ListeningField>
          )}
        </div>
      </Card>

      <div className={styles.stickyActions}>
        {onCancel ? (
          <Button variant="secondary" disabled={submitting} onClick={onCancel}>
            إلغاء
          </Button>
        ) : (
          <Link
            href={
              initial
                ? `/dashboard/listening/${initial.id}`
                : "/dashboard/listening"
            }
            className="ui-button ui-button--secondary ui-focus"
          >
            إلغاء
          </Link>
        )}
        <Button type="submit" loading={submitting} disabled={submitting}>
          {editing ? "حفظ التعديلات" : "إضافة السلسلة"}
        </Button>
      </div>
    </form>
  );
}
