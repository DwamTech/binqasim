"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { Alert, Button, Card, Select } from "@/shared/components/ui";
import { formatArabicFileSize } from "@/shared/lib/arabic-format";
import {
  createScientificLibraryItem,
  updateScientificLibraryItem,
} from "../application/scientific-library.client";
import {
  scientificLibraryItemToFormValues,
  validateScientificLibraryForm,
} from "../application/scientific-library.form";
import {
  emptyScientificLibraryForm,
  scientificLibraryStatusOf,
  type ScientificLibraryFormFiles,
  type ScientificLibraryFormValues,
  type ScientificLibraryItem,
  type ScientificLibraryOptions,
  type ScientificLibrarySourceType,
} from "../domain/scientific-library.contracts";
import {
  fileNameFromPath,
  optionsWithCurrentValue,
  safeLibraryUrl,
  scientificLibraryStatusLabels,
} from "./scientific-library.presentation";
import styles from "./scientific-library.module.css";

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

function SelectedFile({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  return (
    <div className={styles.selectedFile}>
      <span aria-hidden="true">
        {file.name.split(".").at(-1)?.toUpperCase()}
      </span>
      <div>
        <strong>{file.name}</strong>
        <small>{formatArabicFileSize(file.size)}</small>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`إزالة ${file.name}`}
      >
        ×
      </button>
    </div>
  );
}

export function ScientificLibraryForm({
  options,
  initial,
  optionsWarning,
}: {
  options: ScientificLibraryOptions;
  initial?: ScientificLibraryItem;
  optionsWarning?: string;
}) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [values, setValues] = useState<ScientificLibraryFormValues>(() =>
    initial
      ? scientificLibraryItemToFormValues(initial)
      : {
          ...emptyScientificLibraryForm,
          content_type:
            options.content_types[0]?.value ??
            emptyScientificLibraryForm.content_type,
          scientific_field:
            options.scientific_fields[0]?.value ??
            emptyScientificLibraryForm.scientific_field,
        },
  );
  const [files, setFiles] = useState<ScientificLibraryFormFiles>({});
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string>();
  const coverObjectUrlRef = useRef<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const currentCoverUrl = safeLibraryUrl(initial?.cover_url, true);
  const hasCurrentCover = Boolean(initial?.cover_path || initial?.cover_url);
  const visibleCurrentCoverUrl = files.removeCover
    ? undefined
    : currentCoverUrl;
  const adminFileUrl = safeLibraryUrl(initial?.admin_file_url, true);
  const currentExternalUrl = safeLibraryUrl(initial?.source_link);
  const contentTypeOptions = optionsWithCurrentValue(
    options.content_types,
    values.content_type,
  );
  const scientificFieldOptions = optionsWithCurrentValue(
    options.scientific_fields,
    values.scientific_field,
  );
  const status = scientificLibraryStatusOf({
    is_published: values.is_published,
    published_at: values.published_at || null,
  });

  useEffect(
    () => () => {
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
      }
    },
    [],
  );

  function selectCover(file?: File) {
    if (coverObjectUrlRef.current) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
    }
    const nextUrl = file ? URL.createObjectURL(file) : undefined;
    coverObjectUrlRef.current = nextUrl;
    setSelectedCoverUrl(nextUrl);
    setFiles((current) => ({
      ...current,
      cover: file,
      removeCover: false,
    }));
  }

  function removeCurrentCover() {
    if (coverObjectUrlRef.current) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
    }
    coverObjectUrlRef.current = undefined;
    setSelectedCoverUrl(undefined);
    setFiles((current) => ({
      ...current,
      cover: undefined,
      removeCover: true,
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next.cover_path;
      return next;
    });
  }

  function setField<K extends keyof ScientificLibraryFormValues>(
    field: K,
    value: ScientificLibraryFormValues[K],
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
    const nextErrors = validateScientificLibraryForm(values, files, initial);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setGlobalError("راجع الحقول والملفات الموضحة قبل الحفظ.");
      return;
    }
    setSubmitting(true);
    setErrors({});
    setGlobalError(null);
    try {
      const result = initial
        ? await updateScientificLibraryItem(initial.id, values, files)
        : await createScientificLibraryItem(values, files);
      router.replace(
        `/dashboard/library/${result.data.id}?notice=${editing ? "updated" : "created"}`,
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
        reason instanceof Error ? reason.message : "تعذر حفظ المصنَّف.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const sourceChoices: Array<{
    value: ScientificLibrarySourceType;
    label: string;
    description: string;
  }> = [
    {
      value: "file",
      label: "ملف مرفوع",
      description: "ملف PDF محفوظ بصورة خاصة ومهيأ لقارئ الموقع.",
    },
    {
      value: "link",
      label: "رابط خارجي",
      description: "رابط HTTPS، بما في ذلك ملفات Google Drive.",
    },
    {
      value: "embed",
      label: "رابط تضمين آمن",
      description: "رابط عرض يمكن للقارئ تضمينه دون HTML خام.",
    },
  ];

  return (
    <form
      className={styles.form}
      dir="rtl"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      {globalError && (
        <Alert variant="error" title="تعذر حفظ المصنَّف">
          {globalError}
        </Alert>
      )}
      {optionsWarning && <Alert title="تنبيه القوائم">{optionsWarning}</Alert>}

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠١"
          title="الهوية العلمية"
          description="البيانات التي تظهر في بطاقة المصنَّف ونتائج البحث."
        />
        <div className={styles.formGrid}>
          <Field label="عنوان المصنَّف *" error={errors.title} wide>
            <input
              className="ui-input"
              value={values.title}
              maxLength={255}
              onChange={(event) => setField("title", event.target.value)}
            />
          </Field>
          <Field label="العنوان المختصر" error={errors.short_title}>
            <input
              className="ui-input"
              value={values.short_title}
              maxLength={120}
              onChange={(event) => setField("short_title", event.target.value)}
            />
          </Field>
          <Field label="اسم المؤلف *" error={errors.author_name}>
            <input
              className="ui-input"
              value={values.author_name}
              maxLength={255}
              onChange={(event) => setField("author_name", event.target.value)}
            />
          </Field>
          <Field label="نوع المحتوى *" error={errors.content_type}>
            <Select
              value={values.content_type}
              aria-label="نوع المحتوى"
              options={contentTypeOptions}
              onValueChange={(value) => setField("content_type", value)}
            />
          </Field>
          <Field label="المجال العلمي *" error={errors.scientific_field}>
            <Select
              value={values.scientific_field}
              aria-label="المجال العلمي"
              options={scientificFieldOptions}
              onValueChange={(value) => setField("scientific_field", value)}
            />
          </Field>
          <Field label="الوصف *" error={errors.description} wide>
            <textarea
              className="ui-textarea"
              rows={7}
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </Field>
          <Field label="الكلمات المفتاحية" hint="افصل الكلمات بفاصلة." wide>
            <input
              className="ui-input"
              value={values.keywords}
              onChange={(event) => setField("keywords", event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠٢"
          title="بيانات الإصدار"
          description="عدد الصفحات والطبعة والمعلومات الببليوجرافية المعروضة للقارئ."
        />
        <div className={styles.formGrid}>
          <Field label="عدد الصفحات *" error={errors.pages_count}>
            <input
              className="ui-input"
              type="number"
              min={1}
              max={100000}
              inputMode="numeric"
              value={values.pages_count}
              onChange={(event) => setField("pages_count", event.target.value)}
            />
          </Field>
          <Field label="بيانات الإصدار/الطبعة *" error={errors.edition}>
            <input
              className="ui-input"
              value={values.edition}
              maxLength={255}
              placeholder="الطبعة الأولى — ١٤٤٦هـ"
              onChange={(event) => setField("edition", event.target.value)}
            />
          </Field>
          <Field label="معلومات النشر" error={errors.publication_info} wide>
            <textarea
              className="ui-textarea"
              rows={4}
              value={values.publication_info}
              onChange={(event) =>
                setField("publication_info", event.target.value)
              }
            />
          </Field>
        </div>
      </Card>

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠٣"
          title="مصدر القراءة"
          description="اختر ملفًا خاصًا أو رابط HTTPS؛ لن يُرسل مسار التخزين الخام إلى المتصفح."
        />
        <div className={styles.choiceGrid}>
          {sourceChoices.map((choice) => (
            <label
              key={choice.value}
              className={`${styles.choiceCard} ${values.source_type === choice.value ? styles.choiceCardActive : ""}`}
            >
              <input
                type="radio"
                name="source-choice"
                checked={values.source_type === choice.value}
                onChange={() => {
                  setField("source_type", choice.value);
                  if (choice.value === "embed") {
                    setField("download_allowed", false);
                  }
                  if (choice.value !== "file") {
                    setFiles((current) => ({
                      ...current,
                      file: undefined,
                    }));
                    setErrors((current) => {
                      const next = { ...current };
                      delete next.file_path;
                      return next;
                    });
                  }
                }}
              />
              <strong>{choice.label}</strong>
              <small>{choice.description}</small>
            </label>
          ))}
        </div>

        {values.source_type === "file" ? (
          <div className={styles.mediaStack}>
            {editing && initial?.source_type === "file" && (
              <div className={styles.currentMedia}>
                <div>
                  <span>الملف الحالي</span>
                  <strong>{fileNameFromPath(initial.file_path)}</strong>
                  <small>الملف محفوظ في التخزين الخاص.</small>
                </div>
                {adminFileUrl && (
                  <a
                    href={adminFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ui-button ui-button--secondary ui-focus"
                  >
                    معاينة إدارية آمنة
                  </a>
                )}
              </div>
            )}
            <label className={styles.uploadBox}>
              <input
                type="file"
                accept=".pdf,application/pdf"
                aria-label={
                  editing ? "استبدال ملف المصنَّف" : "رفع ملف المصنَّف"
                }
                onChange={(event) =>
                  setFiles((current) => ({
                    ...current,
                    file: event.target.files?.[0],
                  }))
                }
              />
              <strong>
                {editing ? "استبدال ملف المصنَّف" : "رفع ملف المصنَّف"}
              </strong>
              <small>PDF فقط — حتى ٥٠MB.</small>
            </label>
            {files.file && (
              <SelectedFile
                file={files.file}
                onRemove={() =>
                  setFiles((current) => ({ ...current, file: undefined }))
                }
              />
            )}
            {errors.file_path?.[0] && (
              <em className={styles.fieldError} role="alert">
                {errors.file_path[0]}
              </em>
            )}
          </div>
        ) : (
          <div className={styles.mediaStack}>
            {editing && currentExternalUrl && (
              <div className={styles.currentMedia}>
                <div>
                  <span>الرابط الحالي</span>
                  <strong dir="ltr">{currentExternalUrl}</strong>
                </div>
                <a
                  href={currentExternalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ui-button ui-button--secondary ui-focus"
                >
                  اختبار الرابط
                </a>
              </div>
            )}
            <Field
              label={
                values.source_type === "embed"
                  ? "رابط التضمين الآمن *"
                  : "رابط المصدر *"
              }
              error={errors.source_link}
              hint="يجب أن يبدأ الرابط بـ https:// دون بيانات دخول."
              wide
            >
              <input
                className="ui-input"
                type="url"
                dir="ltr"
                value={values.source_link}
                placeholder="https://"
                onChange={(event) =>
                  setField("source_link", event.target.value)
                }
              />
            </Field>
          </div>
        )}
      </Card>

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠٤"
          title="الغلاف"
          description="ارفع غلافًا واضحًا؛ يبقى الغلاف الحالي إن لم تختر بديلًا."
        />
        <div className={styles.coverEditor}>
          <div
            className={styles.coverPreview}
            role="img"
            aria-label="معاينة غلاف المصنَّف"
            style={
              selectedCoverUrl || visibleCurrentCoverUrl
                ? {
                    backgroundImage: `url(${JSON.stringify(selectedCoverUrl ?? visibleCurrentCoverUrl)})`,
                  }
                : undefined
            }
          >
            {!selectedCoverUrl && !visibleCurrentCoverUrl && (
              <strong>
                {values.short_title || values.title || "غلاف المصنَّف"}
              </strong>
            )}
          </div>
          <div className={styles.mediaStack}>
            <label className={styles.uploadBox}>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.avif"
                aria-label="رفع غلاف المصنَّف"
                onChange={(event) => selectCover(event.target.files?.[0])}
              />
              <strong>
                {hasCurrentCover && !files.removeCover
                  ? "استبدال الغلاف"
                  : "رفع غلاف"}
              </strong>
              <small>JPG أو PNG أو WebP أو AVIF — حتى ١٠MB.</small>
            </label>
            {files.cover && (
              <SelectedFile file={files.cover} onRemove={() => selectCover()} />
            )}
            {hasCurrentCover && !files.cover && !files.removeCover && (
              <Button
                type="button"
                variant="danger"
                onClick={removeCurrentCover}
              >
                إزالة الغلاف الحالي
              </Button>
            )}
            {files.removeCover && (
              <div className={styles.currentMedia} role="status">
                <div>
                  <span>الغلاف الحالي</span>
                  <strong>سيُزال عند حفظ التعديلات</strong>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setFiles((current) => ({
                      ...current,
                      removeCover: false,
                    }))
                  }
                >
                  تراجع
                </Button>
              </div>
            )}
            {errors.cover_path?.[0] && (
              <em className={styles.fieldError} role="alert">
                {errors.cover_path[0]}
              </em>
            )}
          </div>
        </div>
      </Card>

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠٥"
          title="الظهور والنشر"
          description="تحكم في إبراز المصنَّف وإتاحته للواجهة العامة."
        />
        <div className={styles.publicationSummary} role="status">
          <span>الحالة الناتجة</span>
          <strong>{scientificLibraryStatusLabels[status]}</strong>
          <small>
            {status === "scheduled"
              ? "سيظهر المصنَّف عند موعد النشر المحدد."
              : status === "published"
                ? "المصنَّف متاح للعامة عند الحفظ."
                : "المصنَّف محفوظ داخل الداشبورد فقط."}
          </small>
        </div>
        <div className={styles.toggleGrid}>
          <label className={styles.toggleCard}>
            <input
              type="checkbox"
              checked={values.is_published}
              onChange={(event) =>
                setField("is_published", event.target.checked)
              }
            />
            <span>
              <strong>تفعيل النشر العام</strong>
              <small>بدون موعد مستقبلي سيصبح منشورًا فورًا.</small>
            </span>
          </label>
          <label className={styles.toggleCard}>
            <input
              type="checkbox"
              checked={values.is_featured}
              onChange={(event) =>
                setField("is_featured", event.target.checked)
              }
            />
            <span>
              <strong>مصنَّف مميز</strong>
              <small>
                تفعيله يجعل هذا المصنَّف هو المميز ويستبدل المصنَّف المميز
                السابق.
              </small>
            </span>
          </label>
          <label className={styles.toggleCard}>
            <input
              type="checkbox"
              checked={values.download_allowed}
              disabled={values.source_type === "embed"}
              onChange={(event) =>
                setField("download_allowed", event.target.checked)
              }
            />
            <span>
              <strong>السماح بالتحميل</strong>
              <small>
                للملف المرفوع أو رابط المصدر؛ روابط Drive والمصادر الخارجية تفتح
                تدفق التحميل وفق الصلاحيات التي يحددها المصدر.
              </small>
            </span>
          </label>
        </div>
        <div className={styles.formGrid}>
          <Field
            label="موعد النشر"
            error={errors.published_at}
            hint="اتركه فارغًا للنشر الفوري عند تفعيل النشر."
          >
            <input
              className="ui-input"
              type="datetime-local"
              value={values.published_at}
              onChange={(event) => setField("published_at", event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <div className={styles.stickyActions}>
        <Link
          href={
            initial ? `/dashboard/library/${initial.id}` : "/dashboard/library"
          }
          className="ui-button ui-button--secondary ui-focus"
        >
          إلغاء
        </Link>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitting
            ? "جارٍ الرفع والحفظ..."
            : editing
              ? "حفظ التعديلات"
              : "إضافة المصنَّف"}
        </Button>
      </div>
    </form>
  );
}
