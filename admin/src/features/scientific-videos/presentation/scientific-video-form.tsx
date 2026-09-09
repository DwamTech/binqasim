"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card } from "@/shared/components/ui";
import {
  createScientificVideo,
  updateScientificVideo,
} from "../application/scientific-videos.client";
import {
  emptyScientificVideoForm,
  itemToScientificVideoForm,
  scientificVideoStatus,
  validateScientificVideoForm,
  type ScientificVideoFormFiles,
  type ScientificVideoFormValues,
  type ScientificVideoItem,
  type ScientificVideoOptions,
  type ScientificVideoSourceType,
  type ScientificVideoStatus,
} from "../domain/scientific-videos";
import styles from "./scientific-videos.module.css";

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
    <label className={wide ? styles.wide : undefined}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
      {error?.[0] && <em role="alert">{error[0]}</em>}
    </label>
  );
}

function withoutVideo(
  current: ScientificVideoFormFiles,
): ScientificVideoFormFiles {
  const next = { ...current };
  delete next.video;
  return next;
}

function withoutThumbnail(
  current: ScientificVideoFormFiles,
): ScientificVideoFormFiles {
  const next = { ...current };
  delete next.thumbnail;
  return next;
}

export function ScientificVideoForm({
  options,
  initial,
  optionsWarning,
}: {
  options: ScientificVideoOptions;
  initial?: ScientificVideoItem;
  optionsWarning?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ScientificVideoFormValues>(() =>
    initial
      ? itemToScientificVideoForm(initial)
      : {
          ...emptyScientificVideoForm,
          category:
            options.categories[0]?.value ?? emptyScientificVideoForm.category,
        },
  );
  const [files, setFiles] = useState<ScientificVideoFormFiles>({});
  const [mode, setMode] = useState<ScientificVideoStatus>(() =>
    initial ? scientificVideoStatus(initial) : "draft",
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const previewRef = useRef<string | undefined>(undefined);

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );
  function setField<K extends keyof ScientificVideoFormValues>(
    field: K,
    value: ScientificVideoFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }
  function setThumbnail(file?: File) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = file ? URL.createObjectURL(file) : undefined;
    previewRef.current = url;
    setPreview(url);
    setFiles((current) => {
      const rest = withoutThumbnail(current);
      return file
        ? { ...rest, thumbnail: file, removeThumbnail: false }
        : { ...rest, removeThumbnail: false };
    });
  }
  function changeSource(source: ScientificVideoSourceType) {
    setField("source_type", source);
    if (source !== "file") setFiles((current) => withoutVideo(current));
    if (source === "embed") setField("download_allowed", false);
  }
  function changeMode(next: ScientificVideoStatus) {
    setMode(next);
    if (next === "draft")
      setValues((current) => ({
        ...current,
        is_published: false,
        published_at: "",
      }));
    else if (next === "published")
      setValues((current) => ({
        ...current,
        is_published: true,
        published_at: "",
      }));
    else setValues((current) => ({ ...current, is_published: true }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validateScientificVideoForm(values, files, initial);
    if (mode === "scheduled" && !values.published_at)
      nextErrors.published_at = ["حدد موعد النشر المجدول."];
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
        ? await updateScientificVideo(initial.id, values, files)
        : await createScientificVideo(values, files);
      router.replace(
        `/dashboard/scientific-videos/${result.data.id}?notice=${initial ? "updated" : "created"}`,
      );
      router.refresh();
    } catch (reason) {
      if (reason && typeof reason === "object" && "fieldErrors" in reason)
        setErrors(
          (reason as { fieldErrors?: Record<string, string[]> }).fieldErrors ??
            {},
        );
      setGlobalError(
        reason instanceof Error ? reason.message : "تعذر حفظ المادة المرئية.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const categoryOptions = options.categories.some(
    (option) => option.value === values.category,
  )
    ? options.categories
    : [
        { value: values.category, label: values.category },
        ...options.categories,
      ];
  return (
    <form className={styles.formStack} onSubmit={submit} noValidate dir="rtl">
      {optionsWarning && <Alert variant="info">{optionsWarning}</Alert>}
      {globalError && <Alert variant="error">{globalError}</Alert>}
      <Card className={styles.formCard ?? ""}>
        <div className={styles.sectionTitle}>
          <span>٠١</span>
          <div>
            <h2>بيانات العرض</h2>
            <p>الحقول التي تظهر في بطاقات الرئيسية والفهرس وصفحة التفاصيل.</p>
          </div>
        </div>
        <div className={styles.formGrid}>
          <Field label="العنوان *" error={errors.title}>
            <input
              className="ui-input"
              maxLength={255}
              value={values.title}
              onChange={(event) => setField("title", event.target.value)}
            />
          </Field>
          <Field label="التصنيف *" error={errors.category}>
            <select
              className="ui-input"
              value={values.category}
              onChange={(event) => setField("category", event.target.value)}
            >
              {categoryOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="المدة بالدقائق *" error={errors.duration_minutes}>
            <input
              className="ui-input"
              type="number"
              min={1}
              max={1440}
              value={values.duration_minutes}
              onChange={(event) =>
                setField("duration_minutes", event.target.value)
              }
            />
          </Field>
          <Field
            label="تاريخ العرض *"
            error={errors.date_label}
            hint="مثال: ١٤٤٧هـ"
          >
            <input
              className="ui-input"
              value={values.date_label}
              onChange={(event) => setField("date_label", event.target.value)}
            />
          </Field>
          <Field label="الكلمات المفتاحية" hint="افصل الكلمات بفاصلة.">
            <input
              className="ui-input"
              value={values.keywords}
              onChange={(event) => setField("keywords", event.target.value)}
            />
          </Field>
          <Field label="الوصف *" error={errors.description} wide>
            <textarea
              className="ui-textarea"
              rows={6}
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className={styles.formCard ?? ""}>
        <div className={styles.sectionTitle}>
          <span>٠٢</span>
          <div>
            <h2>الفيديو والصورة المصغرة</h2>
            <p>اختر ملفًا خاصًا أو رابط منصة خارجية مع معاينة واضحة.</p>
          </div>
        </div>
        <div className={styles.sourceChoices}>
          {options.source_types.map((option) => (
            <label
              className={
                values.source_type === option.value
                  ? styles.activeChoice
                  : undefined
              }
              key={option.value}
            >
              <input
                type="radio"
                name="source"
                value={option.value}
                checked={values.source_type === option.value}
                onChange={() =>
                  changeSource(option.value as ScientificVideoSourceType)
                }
              />
              <strong>{option.label}</strong>
              <small>
                {option.value === "file"
                  ? "يُحفظ بصورة خاصة حتى النشر."
                  : option.value === "embed"
                    ? "YouTube أو Vimeo أو iframe موثوق."
                    : "رابط مباشر أو رابط منصة مشاهدة."}
              </small>
            </label>
          ))}
        </div>
        <div className={styles.formGrid}>
          {values.source_type === "file" ? (
            <Field
              label={`ملف الفيديو ${initial?.source_type === "file" ? "(اتركه للاحتفاظ بالحالي)" : "*"}`}
              error={errors.video_file}
              wide
            >
              <input
                className="ui-input"
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setFiles((current) => {
                    const rest = withoutVideo(current);
                    return file ? { ...rest, video: file } : rest;
                  });
                }}
              />
              {files.video && <small>{files.video.name}</small>}
            </Field>
          ) : (
            <Field
              label="رابط الفيديو *"
              error={errors.source_link}
              hint="HTTPS فقط. يدعم YouTube وVimeo وGoogle Drive والروابط المباشرة."
              wide
            >
              <input
                className="ui-input"
                dir="ltr"
                type="url"
                value={values.source_link}
                onChange={(event) =>
                  setField("source_link", event.target.value)
                }
              />
            </Field>
          )}
          <Field label="الصورة المصغرة" error={errors.thumbnail} wide>
            <input
              className="ui-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => setThumbnail(event.target.files?.[0])}
            />
            {(preview ||
              (!files.removeThumbnail && initial?.thumbnail_url)) && (
              // eslint-disable-next-line @next/next/no-img-element -- local blob and deployment-defined preview URLs are rendered directly.
              <img
                className={styles.previewImage}
                src={preview || initial?.thumbnail_url || ""}
                alt="معاينة الصورة المصغرة"
              />
            )}
            {initial?.thumbnail_url && !files.removeThumbnail && !preview && (
              <button
                type="button"
                className={styles.textButton}
                onClick={() =>
                  setFiles((current) => ({ ...current, removeThumbnail: true }))
                }
              >
                إزالة الصورة الحالية
              </button>
            )}
            {files.removeThumbnail && (
              <button
                type="button"
                className={styles.textButton}
                onClick={() =>
                  setFiles((current) => ({
                    ...current,
                    removeThumbnail: false,
                  }))
                }
              >
                تراجع عن الإزالة
              </button>
            )}
          </Field>
        </div>
      </Card>

      <Card className={styles.formCard ?? ""}>
        <div className={styles.sectionTitle}>
          <span>٠٣</span>
          <div>
            <h2>النشر والإتاحة</h2>
            <p>تحكم في توقيت الظهور والتمييز وإمكانية التحميل.</p>
          </div>
        </div>
        <div className={styles.formGrid}>
          <Field label="حالة النشر">
            <select
              className="ui-input"
              value={mode}
              onChange={(event) =>
                changeMode(event.target.value as ScientificVideoStatus)
              }
            >
              <option value="draft">مسودة</option>
              <option value="published">نشر الآن</option>
              <option value="scheduled">نشر مجدول</option>
            </select>
          </Field>
          {mode === "scheduled" && (
            <Field label="موعد النشر *" error={errors.published_at}>
              <input
                className="ui-input"
                type="datetime-local"
                value={values.published_at}
                onChange={(event) =>
                  setField("published_at", event.target.value)
                }
              />
            </Field>
          )}
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={values.is_featured}
              onChange={(event) =>
                setField("is_featured", event.target.checked)
              }
            />
            <span>
              <strong>مادة مميزة</strong>
              <small>ستحل محل المادة المميزة الحالية في الرئيسية.</small>
            </span>
          </label>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              disabled={values.source_type === "embed"}
              checked={values.download_allowed}
              onChange={(event) =>
                setField("download_allowed", event.target.checked)
              }
            />
            <span>
              <strong>السماح بالتحميل</strong>
              <small>غير متاح لمصدر التضمين.</small>
            </span>
          </label>
        </div>
      </Card>
      <div className={styles.formActions}>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {initial ? "حفظ التعديلات" : "إضافة المادة المرئية"}
        </Button>
        <Link
          className="ui-button ui-button--secondary ui-focus"
          href={
            initial
              ? `/dashboard/scientific-videos/${initial.id}`
              : "/dashboard/scientific-videos"
          }
        >
          إلغاء
        </Link>
      </div>
    </form>
  );
}
