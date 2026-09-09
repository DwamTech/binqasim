"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useMemo, useEffect, useState, type FormEvent } from "react";

import type { AdminSummary } from "@/features/auth/domain/auth.contracts";
import { Alert, Button, Card, Dialog, Select } from "@/shared/components/ui";
import { formatArabicFileSize } from "@/shared/lib/arabic-format";

import {
  createArticle,
  deleteArticleFeaturedImage,
  deleteArticleMedia,
  updateArticle,
} from "../articles.client";
import {
  articleStatusLabels,
  emptyArticleForm,
  formatFileSize,
  type Article,
  type ArticleCatalogs,
  type ArticleFormFiles,
  type ArticleFormValues,
  type ArticleMedia,
  type ArticleStatus,
} from "../articles.contracts";
import {
  allArticleFiles,
  validateArticleFiles,
  validateArticleValues,
} from "../articles.media";
import styles from "./articles.module.css";
import { RichTextEditor } from "./rich-text-editor";

const emptyFiles: ArticleFormFiles = {
  galleryImages: [],
  audioFiles: [],
  documents: [],
  videos: [],
};

const fieldLabels: Record<string, string> = {
  title: "عنوان المقال",
  slug: "الرابط المختصر (Slug)",
  content: "محتوى المقال",
  status: "حالة النشر",
  section_id: "القسم",
  excerpt: "الملخص",
  author_name: "اسم الكاتب",
  published_at: "موعد النشر",
  duration: "المدة",
  location: "الموقع",
  references: "المراجع",
  keywords: "الكلمات المفتاحية",
  featured_image: "الصورة الرئيسية",
  gallery_images: "صور المعرض",
  audio: "الملف الصوتي",
  file: "الملف المرفق",
  video: "الفيديو",
  videos: "الفيديو",
  audio_files: "الصوت",
  documents: "المستند",
  media: "الوسائط",
  response: "استجابة الخادم",
};

function normalizeErrorField(field: string): string {
  return field
    .replace(/^article\./, "")
    .replace(/\.\d+$/, "")
    .replace(/\.\*$/, "");
}

function errorFieldLabel(field: string): string {
  const normalizedField = normalizeErrorField(field);
  return fieldLabels[normalizedField] ?? field;
}

function validationErrorItems(errors: Record<string, string[]>) {
  return Object.entries(errors).flatMap(([field, messages]) =>
    messages.map((message, index) => ({
      key: `${field}-${index}`,
      label: errorFieldLabel(field),
      message,
    })),
  );
}

function normalizeFieldErrors(
  errors: Record<string, string[]>,
): Record<string, string[]> {
  return Object.entries(errors).reduce<Record<string, string[]>>(
    (normalized, [field, messages]) => {
      const key = normalizeErrorField(field);
      normalized[key] = [...(normalized[key] ?? []), ...messages];
      return normalized;
    },
    {},
  );
}

function FileChip({
  file,
  onRemove,
  preview,
}: {
  file: File;
  onRemove: () => void;
  preview?: boolean;
}) {
  const url = useMemo(
    () => (preview ? URL.createObjectURL(file) : null),
    [file, preview],
  );
  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className={styles.fileChip}>
      {url && <img src={url} alt={`معاينة ${file.name}`} />}
      <span>
        <strong>{file.name}</strong>
        <small>{formatArabicFileSize(file.size)}</small>
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`إزالة الملف ${file.name}`}
      >
        ×
      </button>
    </div>
  );
}

const mediaTypeLabels: Record<ArticleMedia["type"], string> = {
  gallery_image: "صورة معرض",
  audio: "ملف صوتي",
  file: "مستند",
  video: "فيديو",
};

function ExistingMediaCard({
  media,
  pending,
  onDelete,
}: {
  media: ArticleMedia;
  pending: boolean;
  onDelete: () => void;
}) {
  const name = media.original_name?.trim() || mediaTypeLabels[media.type];

  return (
    <article className={styles.existingMediaCard}>
      <div className={styles.existingMediaPreview}>
        {media.type === "gallery_image" && (
          <img src={media.url} alt={`معاينة ${name}`} />
        )}
        {media.type === "video" && (
          <video controls preload="metadata">
            <source src={media.url} type={media.mime_type ?? undefined} />
          </video>
        )}
        {media.type === "audio" && (
          <audio controls preload="metadata">
            <source src={media.url} type={media.mime_type ?? undefined} />
          </audio>
        )}
        {media.type === "file" && (
          <div className={styles.existingMediaPlaceholder} aria-hidden="true">
            DOC
          </div>
        )}
      </div>
      <div className={styles.existingMediaInfo}>
        <span>{mediaTypeLabels[media.type]}</span>
        <strong title={name}>{name}</strong>
        <small>
          {[media.mime_type, formatFileSize(media.size)]
            .filter(Boolean)
            .join(" · ")}
        </small>
      </div>
      <div className={styles.existingMediaActions}>
        <a
          className="ui-button ui-button--secondary ui-focus"
          href={media.url}
          target="_blank"
          rel="noreferrer"
        >
          فتح
        </a>
        <Button variant="danger" disabled={pending} onClick={onDelete}>
          حذف
        </Button>
      </div>
    </article>
  );
}

function FieldError({
  field,
  errors,
}: {
  field: string;
  errors: Record<string, string[]>;
}) {
  const messages = Object.entries(errors)
    .filter(([errorField]) => normalizeErrorField(errorField) === field)
    .flatMap(([, fieldMessages]) => fieldMessages);
  if (!messages?.length) return null;
  return (
    <span className={styles.fieldError} role="alert">
      {messages[0]}
    </span>
  );
}

function statusForPublicationDate(value: string): ArticleStatus | null {
  if (!value) return null;
  const selected = new Date(value);
  if (Number.isNaN(selected.getTime())) return null;

  const now = new Date();
  const selectedDay = new Date(
    selected.getFullYear(),
    selected.getMonth(),
    selected.getDate(),
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return selectedDay > today ? "scheduled" : "published";
}

export function ArticleForm({
  actor,
  catalogs,
  initial,
}: {
  actor: AdminSummary;
  catalogs: ArticleCatalogs;
  initial?: Article;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ArticleFormValues>(
    initial
      ? {
          ...emptyArticleForm,
          title: initial.title,
          slug: initial.slug,
          content: initial.content,
          status: initial.status,
          section_id: initial.section?.id ?? "",
          excerpt: initial.excerpt ?? "",
          author_name: initial.author_name ?? "",
          published_at: initial.published_at?.slice(0, 16) ?? "",
          duration: initial.duration ?? "",
          location: initial.location ?? "",
          references: initial.references ?? "",
          keywords: initial.keywords ?? "",
        }
      : emptyArticleForm,
  );
  const [files, setFiles] = useState<ArticleFormFiles>(emptyFiles);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentFeaturedImage, setCurrentFeaturedImage] = useState(
    initial?.featured_image ?? null,
  );
  const [currentMedia, setCurrentMedia] = useState<ArticleMedia[]>(
    initial?.media ?? [],
  );
  const [mediaTarget, setMediaTarget] = useState<
    | { kind: "featured"; name: string }
    | { kind: "media"; media: ArticleMedia }
    | null
  >(null);
  const [mediaPending, setMediaPending] = useState(false);
  const [mediaNotice, setMediaNotice] = useState<string | null>(null);
  const [mediaActionError, setMediaActionError] = useState<string | null>(null);
  const selectedBytes = useMemo(
    () => allArticleFiles(files).reduce((sum, file) => sum + file.size, 0),
    [files],
  );
  const currentSectionInactive =
    initial?.section &&
    !catalogs.sections.some((section) => section.id === initial.section?.id);

  function setField<K extends keyof ArticleFormValues>(
    field: K,
    value: ArticleFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function removeExistingMedia() {
    if (!initial || !mediaTarget || mediaPending) return;

    setMediaPending(true);
    setMediaActionError(null);
    setMediaNotice(null);
    try {
      if (mediaTarget.kind === "featured") {
        await deleteArticleFeaturedImage(initial.id);
        setCurrentFeaturedImage(null);
        setMediaNotice("تم حذف الصورة الرئيسية بنجاح.");
      } else {
        await deleteArticleMedia(initial.id, mediaTarget.media.id);
        setCurrentMedia((items) =>
          items.filter((item) => item.id !== mediaTarget.media.id),
        );
        setMediaNotice(
          `تم حذف «${mediaTarget.media.original_name ?? "الوسيط"}» بنجاح.`,
        );
      }
      setMediaTarget(null);
    } catch (reason) {
      setMediaActionError(
        reason instanceof Error ? reason.message : "تعذر حذف الوسيط.",
      );
    } finally {
      setMediaPending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || mediaPending) return;
    const nextErrors = {
      ...validateArticleValues(values),
      ...validateArticleFiles(files),
    };
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setGlobalError("صحّح الأخطاء التالية ثم حاول الحفظ مرة أخرى.");
      return;
    }

    setSubmitting(true);
    setGlobalError(null);
    setErrors({});
    try {
      const result = initial
        ? await updateArticle(initial.id, values, files)
        : await createArticle(values, files);
      router.replace(
        `/dashboard/articles/${result.article.id}?notice=${initial ? "updated" : "created"}`,
      );
      router.refresh();
    } catch (reason) {
      let receivedFieldErrors: Record<string, string[]> | undefined;
      if (reason && typeof reason === "object" && "fieldErrors" in reason) {
        receivedFieldErrors = (
          reason as { fieldErrors?: Record<string, string[]> }
        ).fieldErrors;
        if (receivedFieldErrors) {
          receivedFieldErrors = normalizeFieldErrors(receivedFieldErrors);
          setErrors(receivedFieldErrors);
        }
      }
      setGlobalError(
        receivedFieldErrors && Object.keys(receivedFieldErrors).length > 0
          ? "صحّح الأخطاء التالية ثم حاول الحفظ مرة أخرى."
          : reason instanceof Error
            ? reason.message
            : "تعذر حفظ المقال.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => void submit(event)}
      noValidate
    >
      {globalError && (
        <Alert variant="error" title="تعذر حفظ المقال">
          <div className={styles.validationSummary}>
            <p>{globalError}</p>
            {validationErrorItems(errors).length > 0 && (
              <ul>
                {validationErrorItems(errors).map((item) => (
                  <li key={item.key}>
                    <strong>{item.label}:</strong> {item.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Alert>
      )}
      <div className={styles.formOverview}>
        <div>
          <span>مساحة تحرير احترافية</span>
          <strong>{initial ? "تحديث المقال" : "مقال جديد"}</strong>
          <small>
            اكتب ونسّق وراجع المحتوى قبل النشر من مساحة واحدة منظمة.
          </small>
        </div>
        <div className={styles.formOverviewStats}>
          <span>
            <strong>AR / EN</strong>
            اتجاهات ثنائية
          </span>
          <span>
            <strong>Rich Text</strong>
            تنسيق متقدم
          </span>
          <span>
            <strong>Safe HTML</strong>
            محتوى منقّى
          </span>
        </div>
      </div>
      <Card className={styles.formSection ?? ""}>
        <div className={styles.sectionHeading}>
          <span>٠١</span>
          <div>
            <h2>المحتوى الأساسي</h2>
            <p>
              العنوان والمحتوى الذي سيظهر في المقال؛ الرابط المختصر يُنشأ
              تلقائيًا.
            </p>
          </div>
        </div>
        <div className={styles.formGrid}>
          <label className={styles.fullField}>
            <span>عنوان المقال *</span>
            <input
              className="ui-input"
              placeholder="اكتب عنوانًا واضحًا وجذابًا للمقال"
              value={values.title}
              maxLength={255}
              onChange={(event) => setField("title", event.target.value)}
              aria-invalid={Boolean(errors.title)}
            />
            <FieldError field="title" errors={errors} />
          </label>
          <label className={styles.fullField}>
            <span>المختصر</span>
            <textarea
              className="ui-textarea"
              rows={3}
              maxLength={500}
              placeholder="ملخص قصير يظهر في كروت المقالات والدراسات ونتائج البحث"
              value={values.excerpt}
              onChange={(event) => setField("excerpt", event.target.value)}
            />
            <small className={styles.characterHint}>
              {values.excerpt.length.toLocaleString("ar-EG")} / ٥٠٠ حرف
            </small>
          </label>
          <div className={`${styles.fullField} ${styles.editorField}`}>
            <div className={styles.editorFieldHeading}>
              <div>
                <span>محتوى المقال *</span>
                <small>
                  تنسيق شبيه ببرامج معالجة النصوص مع دعم العربية والإنجليزية.
                </small>
              </div>
              <span>يدعم RTL / LTR</span>
            </div>
            <RichTextEditor
              value={values.content}
              onChange={(content) => setField("content", content)}
              invalid={Boolean(errors.content)}
            />
            <FieldError field="content" errors={errors} />
          </div>
        </div>
      </Card>

      <Card className={styles.formSection ?? ""}>
        <div className={styles.sectionHeading}>
          <span>٠٢</span>
          <div>
            <h2>التصنيف والنشر</h2>
            <p>حدد القسم والحالة والتواريخ المعتمدة.</p>
          </div>
        </div>
        {currentSectionInactive && initial?.section && (
          <Alert title="القسم الحالي غير نشط">
            سيظل «{initial.section.name}» محفوظًا ما لم تختر قسمًا آخر.
          </Alert>
        )}
        <div className={styles.formGrid}>
          <label>
            <span>القسم</span>
            <Select
              value={values.section_id}
              aria-label="قسم المقال"
              options={[
                { value: "", label: "بدون قسم" },
                ...(currentSectionInactive && initial?.section
                  ? [
                      {
                        value: initial.section.id,
                        label: `${initial.section.name} — غير نشط`,
                      },
                    ]
                  : []),
                ...catalogs.sections.map((section) => ({
                  value: section.id,
                  label: section.name,
                })),
              ]}
              onValueChange={(value) => setField("section_id", value)}
            />
            <FieldError field="section_id" errors={errors} />
          </label>
          <label>
            <span>الحالة *</span>
            <Select
              value={values.status}
              aria-label="حالة المقال"
              options={(
                Object.keys(articleStatusLabels) as ArticleStatus[]
              ).map((status) => ({
                value: status,
                label: articleStatusLabels[status],
              }))}
              onValueChange={(value) =>
                setField(
                  "status",
                  value === "published" || value === "scheduled"
                    ? (statusForPublicationDate(values.published_at) ??
                        "published")
                    : (value as ArticleStatus),
                )
              }
            />
            {actor.role !== "admin" && (
              <small>
                الخادم يسمح للكاتب بتحديد الحالة عند الحفظ، لكن تغييرها لاحقًا
                من زر الحالة متاح للمدير فقط.
              </small>
            )}
          </label>
          <label>
            <span>اسم الكاتب الظاهر</span>
            <input
              className="ui-input"
              placeholder="مثال: فريق التحرير"
              value={values.author_name}
              onChange={(event) => setField("author_name", event.target.value)}
            />
          </label>
          <label>
            <span>تاريخ النشر</span>
            <input
              className="ui-input"
              type="datetime-local"
              value={values.published_at}
              onChange={(event) => {
                const publishedAt = event.target.value;
                const derivedStatus = statusForPublicationDate(publishedAt);
                setValues((current) => ({
                  ...current,
                  published_at: publishedAt,
                  ...(derivedStatus ? { status: derivedStatus } : {}),
                }));
                setErrors((current) => {
                  const next = { ...current };
                  delete next.published_at;
                  delete next.status;
                  return next;
                });
              }}
            />
            <small>
              اليوم أو تاريخ سابق يُنشر فورًا، واليوم القادم وما بعده يُجدول
              تلقائيًا. التاريخان الميلادي والهجري يُحفظان تلقائيًا.
            </small>
          </label>
        </div>
      </Card>

      <Card className={styles.formSection ?? ""}>
        <div className={styles.sectionHeading}>
          <span>٠٣</span>
          <div>
            <h2>بيانات إضافية</h2>
            <p>تفاصيل اختيارية تساعد على إثراء المقال.</p>
          </div>
        </div>
        <div className={styles.formGrid}>
          <label>
            <span>المدة</span>
            <input
              className="ui-input"
              placeholder="مثال: ٥ دقائق قراءة"
              value={values.duration}
              onChange={(event) => setField("duration", event.target.value)}
            />
          </label>
          <label>
            <span>الموقع</span>
            <input
              className="ui-input"
              placeholder="مثال: الرياض"
              value={values.location}
              onChange={(event) => setField("location", event.target.value)}
            />
          </label>
          <label className={styles.fullField}>
            <span>الكلمات المفتاحية</span>
            <input
              className="ui-input"
              placeholder="سياحة، ابتكار، أخبار الجمعية"
              value={values.keywords}
              onChange={(event) => setField("keywords", event.target.value)}
            />
          </label>
          <label className={styles.fullField}>
            <span>المراجع</span>
            <textarea
              className="ui-textarea"
              rows={3}
              placeholder="أضف المراجع أو المصادر، كل مرجع في سطر مستقل"
              value={values.references}
              onChange={(event) => setField("references", event.target.value)}
            />
          </label>
        </div>
      </Card>

      <Card className={styles.formSection ?? ""}>
        <div className={styles.sectionHeading}>
          <span>٠٤</span>
          <div>
            <h2>الوسائط</h2>
            <p>
              صور المعرض حتى ١٥٠MB للصورة، والفيديو حتى ٢٠٠MB. الصوت والمستند
              حتى ٢MB لكل ملف.
            </p>
          </div>
        </div>
        {initial && (
          <section className={styles.existingMediaSection}>
            <div className={styles.existingMediaHeading}>
              <div>
                <h3>الوسائط الحالية</h3>
                <p>
                  هذه الملفات محفوظة بالفعل. يمكنك فتحها أو حذفها قبل إضافة
                  ملفات جديدة.
                </p>
              </div>
              <span>
                {(
                  currentMedia.length + (currentFeaturedImage ? 1 : 0)
                ).toLocaleString("ar-SA")}{" "}
                ملف
              </span>
            </div>

            {mediaNotice && (
              <div className={styles.mediaNotice} role="status">
                {mediaNotice}
              </div>
            )}
            {mediaActionError && (
              <div className={styles.mediaActionError} role="alert">
                {mediaActionError}
              </div>
            )}

            {currentFeaturedImage || currentMedia.length > 0 ? (
              <div className={styles.existingMediaGrid}>
                {currentFeaturedImage && (
                  <article className={styles.existingMediaCard}>
                    <div className={styles.existingMediaPreview}>
                      <img
                        src={currentFeaturedImage}
                        alt={`الصورة الرئيسية لمقال ${initial.title}`}
                      />
                    </div>
                    <div className={styles.existingMediaInfo}>
                      <span>الصورة الرئيسية</span>
                      <strong>الصورة الرئيسية الحالية</strong>
                      <small>
                        {files.featuredImage
                          ? "سيتم استبدالها بالصورة الجديدة عند الحفظ"
                          : "مستخدمة كواجهة للمقال"}
                      </small>
                    </div>
                    <div className={styles.existingMediaActions}>
                      <a
                        className="ui-button ui-button--secondary ui-focus"
                        href={currentFeaturedImage}
                        target="_blank"
                        rel="noreferrer"
                      >
                        فتح
                      </a>
                      <Button
                        variant="danger"
                        disabled={mediaPending}
                        onClick={() => {
                          setMediaActionError(null);
                          setMediaTarget({
                            kind: "featured",
                            name: "الصورة الرئيسية",
                          });
                        }}
                      >
                        حذف
                      </Button>
                    </div>
                  </article>
                )}
                {currentMedia.map((media) => (
                  <ExistingMediaCard
                    key={media.id}
                    media={media}
                    pending={mediaPending}
                    onDelete={() => {
                      setMediaActionError(null);
                      setMediaTarget({ kind: "media", media });
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.emptyMedia}>
                لا توجد وسائط محفوظة حاليًا لهذا المقال.
              </p>
            )}
          </section>
        )}

        <div className={styles.newMediaHeading}>
          <h3>{initial ? "إضافة وسائط جديدة" : "اختيار الوسائط"}</h3>
          <p>
            {initial
              ? "الملفات الجديدة ستُضاف إلى الوسائط الحالية، والصورة الرئيسية الجديدة ستستبدل الحالية."
              : "اختر الملفات التي تريد إرفاقها بالمقال."}
          </p>
        </div>
        <div className={styles.uploadGrid}>
          <label className={styles.fileField}>
            <span>الصورة الرئيسية</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(event) =>
                setFiles((current) => ({
                  ...current,
                  featuredImage: event.target.files?.[0],
                }))
              }
            />
          </label>
          <label className={styles.fileField}>
            <span>صور المعرض</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []);
                setFiles((current) => ({
                  ...current,
                  galleryImages: [...current.galleryImages, ...selected],
                }));
                event.target.value = "";
              }}
            />
          </label>
          <label className={styles.fileField}>
            <span>الصوت</span>
            <input
              type="file"
              multiple
              accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []);
                setFiles((current) => ({
                  ...current,
                  audioFiles: [...(current.audioFiles ?? []), ...selected],
                }));
                event.target.value = "";
              }}
            />
          </label>
          <label className={styles.fileField}>
            <span>المستند</span>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []);
                setFiles((current) => ({
                  ...current,
                  documents: [...(current.documents ?? []), ...selected],
                }));
                event.target.value = "";
              }}
            />
          </label>
          <label className={styles.fileField}>
            <span>الفيديو</span>
            <input
              type="file"
              multiple
              accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []);
                setFiles((current) => ({
                  ...current,
                  videos: [...(current.videos ?? []), ...selected],
                }));
                event.target.value = "";
              }}
            />
          </label>
        </div>
        <div className={styles.fileList}>
          {files.featuredImage && (
            <FileChip
              file={files.featuredImage}
              preview
              onRemove={() =>
                setFiles((current) => ({
                  ...current,
                  featuredImage: undefined,
                }))
              }
            />
          )}
          {files.galleryImages.map((file, index) => (
            <FileChip
              key={`${file.name}-${file.size}-${index}`}
              file={file}
              preview
              onRemove={() =>
                setFiles((current) => ({
                  ...current,
                  galleryImages: current.galleryImages.filter(
                    (_, itemIndex) => itemIndex !== index,
                  ),
                }))
              }
            />
          ))}
          {(files.audioFiles ?? []).map((file, index) => (
            <FileChip
              key={`audio-${file.name}-${file.size}-${index}`}
              file={file}
              onRemove={() =>
                setFiles((current) => ({
                  ...current,
                  audioFiles: (current.audioFiles ?? []).filter(
                    (_, itemIndex) => itemIndex !== index,
                  ),
                }))
              }
            />
          ))}
          {(files.documents ?? []).map((file, index) => (
            <FileChip
              key={`document-${file.name}-${file.size}-${index}`}
              file={file}
              onRemove={() =>
                setFiles((current) => ({
                  ...current,
                  documents: (current.documents ?? []).filter(
                    (_, itemIndex) => itemIndex !== index,
                  ),
                }))
              }
            />
          ))}
          {(files.videos ?? []).map((file, index) => (
            <FileChip
              key={`video-${file.name}-${file.size}-${index}`}
              file={file}
              onRemove={() =>
                setFiles((current) => ({
                  ...current,
                  videos: (current.videos ?? []).filter(
                    (_, itemIndex) => itemIndex !== index,
                  ),
                }))
              }
            />
          ))}
        </div>
        <p className={styles.totalSize}>
          إجمالي الملفات الجديدة المختارة: {formatArabicFileSize(selectedBytes)}
        </p>
        {[
          "featured_image",
          "gallery_images",
          "audio",
          "audio_files",
          "file",
          "documents",
          "video",
          "videos",
          "media",
        ].map((field) => (
          <FieldError key={field} field={field} errors={errors} />
        ))}
      </Card>

      <Dialog
        open={mediaTarget !== null}
        onOpenChange={(open) => !mediaPending && !open && setMediaTarget(null)}
        title="تأكيد حذف الوسيط"
        dismissible={!mediaPending}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={mediaPending}
              onClick={() => setMediaTarget(null)}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              loading={mediaPending}
              disabled={mediaPending}
              onClick={() => void removeExistingMedia()}
            >
              حذف نهائي
            </Button>
          </div>
        }
      >
        <p>
          سيتم حذف{" "}
          <strong>
            {mediaTarget?.kind === "featured"
              ? mediaTarget.name
              : (mediaTarget?.media.original_name ?? "الوسيط المحدد")}
          </strong>{" "}
          من المقال والتخزين. لا يمكن التراجع عن هذه الخطوة.
        </p>
        {mediaActionError && (
          <p role="alert" className={styles.errorText}>
            {mediaActionError}
          </p>
        )}
      </Dialog>

      <div className={styles.stickyActions}>
        <Button
          type="button"
          variant="secondary"
          disabled={submitting || mediaPending}
          onClick={() => router.back()}
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          loading={submitting}
          disabled={submitting || mediaPending}
        >
          {submitting
            ? "جارٍ الرفع والحفظ..."
            : initial
              ? "حفظ التعديلات"
              : "إنشاء المقال"}
        </Button>
      </div>
    </form>
  );
}
