"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
  createHadithCard,
  createHadithCardProject,
  deleteHadithCard,
  deleteHadithCardProject,
  getHadithCardProject,
  HadithCardsClientError,
  hadithCardGalleryUploadBatchSize,
  uploadHadithCardGallery,
  updateHadithCard,
  updateHadithCardProject,
} from "../application/hadith-cards.client";
import {
  cardToHadithCardForm,
  emptyHadithCardForm,
  emptyHadithCardProjectForm,
  hadithCardStatusLabel,
  hadithCardStatuses,
  projectToHadithCardProjectForm,
  validateHadithCardForm,
  validateHadithCardGalleryFiles,
  validateHadithCardProjectForm,
  type HadithCard,
  type HadithCardBulkMutation,
  type HadithCardCoverImageSource,
  type HadithCardFormFiles,
  type HadithCardFormValues,
  type HadithCardProject,
  type HadithCardProjectFormFiles,
  type HadithCardProjectFormValues,
  type HadithCardProjectPage,
  type HadithCardStatus,
} from "../domain/hadith-cards";
import {
  Button,
  Card,
  Dialog,
  EmptyState,
  Alert,
  Badge,
  Spinner,
} from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import styles from "./hadith-cards.module.css";

type Editor =
  | { kind: "project"; record?: HadithCardProject }
  | { kind: "card"; project: HadithCardProject; record?: HadithCard }
  | { kind: "gallery"; project: HadithCardProject };

type DeleteTarget =
  | { kind: "project"; record: HadithCardProject }
  | { kind: "card"; project: HadithCardProject; record: HadithCard };

type ProjectStats = HadithCardProjectPage["stats"];
const emptyCards: HadithCard[] = [];

function statusVariant(
  status: HadithCardStatus,
): "success" | "warning" | "danger" {
  if (status === "published") return "success";
  if (status === "scheduled") return "warning";
  return "danger";
}

function statusContribution(status: HadithCardStatus) {
  return {
    published: status === "published" ? 1 : 0,
    drafts: status === "draft" ? 1 : 0,
  };
}

function mergeProject(
  existing: HadithCardProject | undefined,
  incoming: HadithCardProject,
): HadithCardProject {
  if (!existing) return incoming;
  return {
    ...existing,
    ...incoming,
    cards: existing.cards.length > 0 ? existing.cards : incoming.cards,
  };
}

function sortCards(cards: HadithCard[]) {
  return [...cards].toSorted(
    (left, right) =>
      left.sort_order - right.sort_order || Number(left.id) - Number(right.id),
  );
}

function updateProjectStats(
  current: ProjectStats,
  before: HadithCardProject | null,
  after: HadithCardProject | null,
): ProjectStats {
  const previous = before ? statusContribution(before.status) : null;
  const next = after ? statusContribution(after.status) : null;
  return {
    ...current,
    total: Math.max(0, current.total + (after ? 1 : 0) - (before ? 1 : 0)),
    published: Math.max(
      0,
      current.published + (next?.published ?? 0) - (previous?.published ?? 0),
    ),
    drafts: Math.max(
      0,
      current.drafts + (next?.drafts ?? 0) - (previous?.drafts ?? 0),
    ),
  };
}

function updateProjectCardCounts(
  project: HadithCardProject,
  cardsDelta: number,
  publishedDelta: number,
): HadithCardProject {
  return {
    ...project,
    cards_count: Math.max(0, project.cards_count + cardsDelta),
    published_cards_count: Math.max(
      0,
      project.published_cards_count + publishedDelta,
    ),
  };
}

function previewUrl(card: HadithCard): string | null {
  const candidate = card.image_url?.trim();
  if (!candidate) return null;
  if (/^https?:\/\//i.test(candidate)) return candidate;
  // Uploaded files are presented by the BFF as absolute URLs. Relative URLs
  // may deliberately point to the public website's legacy media directory,
  // so the dashboard shows a graceful placeholder instead of a broken image.
  return card.image_source_type === "file" ? candidate : null;
}

function replaceSelectedProjectInUrl(projectId: string | null) {
  const url = new URL(window.location.href);
  if (projectId) url.searchParams.set("project_id", projectId);
  else url.searchParams.delete("project_id");
  window.history.replaceState({}, "", url);
}

function Field({
  label,
  hint,
  error,
  wide = false,
  children,
}: {
  label: string;
  hint?: string | undefined;
  error?: string[] | undefined;
  wide?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <label className={`${styles.field} ${wide ? styles.fieldWide : ""}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
      {error?.[0] && <em role="alert">{error[0]}</em>}
    </label>
  );
}

function PublicationFields<
  Values extends { is_published: boolean; published_at: string },
>({
  values,
  setField,
  errors,
}: {
  values: Values;
  setField: <Key extends keyof Values>(key: Key, value: Values[Key]) => void;
  errors: Record<string, string[]>;
}) {
  return (
    <>
      <label className={styles.publishToggle}>
        <input
          type="checkbox"
          checked={values.is_published}
          onChange={(event) =>
            setField(
              "is_published" as keyof Values,
              event.target.checked as Values[keyof Values],
            )
          }
        />
        <span>
          <strong>إتاحة للعامة</strong>
          <small>المسودة تبقى داخل الداشبورد فقط.</small>
        </span>
      </label>
      {values.is_published && (
        <Field
          label="موعد النشر (اختياري)"
          hint="اتركه فارغًا للنشر الفوري."
          error={errors.published_at}
          wide
        >
          <input
            className="ui-input"
            type="datetime-local"
            value={values.published_at}
            onChange={(event) =>
              setField(
                "published_at" as keyof Values,
                event.target.value as Values[keyof Values],
              )
            }
          />
        </Field>
      )}
    </>
  );
}

function ProjectEditor({
  record,
  onSaved,
  onCancel,
}: {
  record?: HadithCardProject | undefined;
  onSaved: (
    project: HadithCardProject,
    created: boolean,
    notice?: string,
  ) => void;
  onCancel: () => void;
}) {
  const editing = Boolean(record);
  const [values, setValues] = useState<HadithCardProjectFormValues>(
    record
      ? projectToHadithCardProjectForm(record)
      : { ...emptyHadithCardProjectForm },
  );
  const [files, setFiles] = useState<HadithCardProjectFormFiles>({});
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [galleryInputKey, setGalleryInputKey] = useState(0);
  const [galleryProgress, setGalleryProgress] = useState<{
    completed: number;
    total: number;
    batch: number;
    batches: number;
  } | null>(null);

  function setField<Key extends keyof HadithCardProjectFormValues>(
    key: Key,
    value: HadithCardProjectFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  useEffect(
    () => () => {
      if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    },
    [coverPreview],
  );

  function setCoverFile(file: File | undefined) {
    setFiles((current) => {
      const next = { ...current };
      if (file) next.cover_image_file = file;
      else delete next.cover_image_file;
      return next;
    });
    setCoverPreview(file ? URL.createObjectURL(file) : null);
    setErrors((current) => {
      const next = { ...current };
      delete next.cover_image_file;
      return next;
    });
  }

  function setCoverSource(source: HadithCardCoverImageSource) {
    setValues((current) => ({
      ...current,
      cover_image_source_type: source,
      cover_image_url: source === "url" ? current.cover_image_url : "",
      cover_alt_text: source === "none" ? "" : current.cover_alt_text,
    }));
    if (source !== "file") setCoverFile(undefined);
    setErrors((current) => {
      const next = { ...current };
      delete next.cover_image_source_type;
      delete next.cover_image_url;
      delete next.cover_alt_text;
      return next;
    });
  }

  const persistedCover =
    values.cover_image_source_type === "file"
      ? (record?.cover_image_url ?? null)
      : values.cover_image_url;
  const activeCoverPreview =
    values.cover_image_source_type === "none"
      ? null
      : (coverPreview ?? persistedCover);
  const selectedGalleryFiles = files.gallery_files ?? [];

  function setGalleryFiles(nextFiles: FileList | null) {
    const selected = Array.from(nextFiles ?? []);
    const galleryErrors = validateHadithCardGalleryFiles(selected);
    setFiles((current) => ({ ...current, gallery_files: selected }));
    setGalleryProgress(null);
    setErrors((current) => {
      const next = { ...current, ...galleryErrors };
      if (!galleryErrors.gallery_files) delete next.gallery_files;
      return next;
    });
  }

  function clearGalleryFiles() {
    setFiles((current) => {
      const next = { ...current };
      delete next.gallery_files;
      return next;
    });
    setGalleryProgress(null);
    setGalleryInputKey((current) => current + 1);
    setErrors((current) => {
      const next = { ...current };
      delete next.gallery_files;
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validateHadithCardProjectForm(values, files, record);
    const selectedGalleryFiles = files.gallery_files ?? [];
    if (selectedGalleryFiles.length > 0) {
      Object.assign(
        nextErrors,
        validateHadithCardGalleryFiles(selectedGalleryFiles),
      );
    }
    if (!editing && values.is_published && selectedGalleryFiles.length === 0) {
      nextErrors.gallery_files = [
        "أضف صورة واحدة على الأقل للجاليري قبل إتاحة القسم للعامة.",
      ];
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setGlobalError("راجع الحقول المطلوبة قبل الحفظ.");
      return;
    }

    setSubmitting(true);
    setGlobalError(null);
    setErrors({});
    let persistedProject: HadithCardProject | null = null;
    let uploadedGalleryCount = 0;
    setGalleryProgress(
      selectedGalleryFiles.length > 0
        ? {
            completed: 0,
            total: selectedGalleryFiles.length,
            batch: 0,
            batches: Math.ceil(
              selectedGalleryFiles.length / hadithCardGalleryUploadBatchSize,
            ),
          }
        : null,
    );
    try {
      // The first small batch travels with section creation, so the first
      // public render is complete. The remaining selected images are appended
      // through the dedicated bulk endpoint in safe browser-sized batches.
      const firstGalleryBatch = selectedGalleryFiles.slice(
        0,
        hadithCardGalleryUploadBatchSize,
      );
      const remainingGalleryFiles = selectedGalleryFiles.slice(
        hadithCardGalleryUploadBatchSize,
      );
      const initialFiles: HadithCardProjectFormFiles = {
        ...files,
        ...(firstGalleryBatch.length > 0
          ? { gallery_files: firstGalleryBatch }
          : {}),
      };
      if (firstGalleryBatch.length === 0) delete initialFiles.gallery_files;

      const result = record
        ? await updateHadithCardProject(record.id, values, initialFiles)
        : await createHadithCardProject(values, initialFiles);
      let savedProject = result.data;
      persistedProject = savedProject;

      if (firstGalleryBatch.length > 0) {
        uploadedGalleryCount = firstGalleryBatch.length;
        setGalleryProgress((current) =>
          current
            ? {
                ...current,
                completed: firstGalleryBatch.length,
                batch: 1,
              }
            : current,
        );
      }

      if (remainingGalleryFiles.length > 0) {
        const appended = await uploadHadithCardGallery(
          savedProject.id,
          remainingGalleryFiles,
          {
            onProgress: (progress) => {
              uploadedGalleryCount =
                firstGalleryBatch.length + progress.completed;
              setGalleryProgress({
                completed: firstGalleryBatch.length + progress.completed,
                total: selectedGalleryFiles.length,
                batch: progress.batch + (firstGalleryBatch.length ? 1 : 0),
                batches: Math.ceil(
                  selectedGalleryFiles.length /
                    hadithCardGalleryUploadBatchSize,
                ),
              });
            },
          },
        );
        // Detail is normally inexpensive and gives the workspace exact card
        // ordering/counts after an arbitrary number of appended batches.
        try {
          savedProject = await getHadithCardProject(savedProject.id);
        } catch {
          const known = new Map(
            savedProject.cards.map((card) => [card.id, card]),
          );
          appended.data.cards.forEach((card) => known.set(card.id, card));
          savedProject = {
            ...savedProject,
            cards: sortCards([...known.values()]),
            cards_count: savedProject.cards_count + appended.data.created_count,
            published_cards_count:
              savedProject.published_cards_count +
              appended.data.cards.filter((card) => card.status === "published")
                .length,
          };
        }
      }

      onSaved(
        savedProject,
        !editing,
        selectedGalleryFiles.length > 0
          ? `تم حفظ القسم ورفع ${formatArabicNumber(selectedGalleryFiles.length)} صورة للجاليري.`
          : undefined,
      );
    } catch (reason) {
      // The database operation can already have succeeded before a later bulk
      // batch fails. Never let a retry create a duplicate section: persist the
      // exact partial state in the workspace, then let the editor reopen the
      // gallery uploader for the remaining images.
      if (persistedProject) {
        let latestProject = persistedProject;
        try {
          latestProject = await getHadithCardProject(persistedProject.id);
        } catch {
          // The initial project response is still a truthful fallback.
        }
        onSaved(
          latestProject,
          !editing,
          `تم حفظ القسم ورفع ${formatArabicNumber(uploadedGalleryCount)} من أصل ${formatArabicNumber(selectedGalleryFiles.length)} صورة. أعد فتح «إضافة صور للجاليري» لإكمال الصور المتبقية.`,
        );
        return;
      }
      if (reason instanceof HadithCardsClientError && reason.fieldErrors) {
        setErrors(reason.fieldErrors);
      }
      setGlobalError(
        reason instanceof Error ? reason.message : "تعذر حفظ القسم.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className={styles.dialogForm}
      dir="rtl"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      {globalError && (
        <Alert variant="error" title="تعذّر الحفظ">
          {globalError}
        </Alert>
      )}
      <div className={styles.dialogLead}>
        <span aria-hidden="true">١</span>
        <div>
          <strong>{editing ? "تحديث القسم" : "إنشاء قسم جديد"}</strong>
          <p>
            {editing
              ? "حدّث بيانات القسم وغلافه وحالة ظهوره من مساحة واحدة مرتبة."
              : "أدخل بيانات القسم ثم أضف الغلاف وصور الجاليري؛ الرابط المختصر يُنشأ تلقائيًا."}
          </p>
        </div>
      </div>
      <section
        className={styles.formSection}
        aria-labelledby="section-basic-data"
      >
        <div className={styles.formSectionHeading}>
          <span>٠١</span>
          <div>
            <strong id="section-basic-data">بيانات القسم</strong>
            <small>العنوان والوصف وترتيب الظهور في واجهة الموقع.</small>
          </div>
        </div>
        <div className={styles.formGrid}>
          <Field label="عنوان القسم *" error={errors.title} wide>
            <input
              className="ui-input"
              autoFocus
              maxLength={255}
              placeholder="مثال: بطاقات من السنة النبوية"
              value={values.title}
              onChange={(event) => setField("title", event.target.value)}
            />
          </Field>
          <Field label="عنوان تمهيدي" error={errors.eyebrow}>
            <input
              className="ui-input"
              maxLength={160}
              placeholder="وصف قصير أعلى عنوان القسم"
              value={values.eyebrow}
              onChange={(event) => setField("eyebrow", event.target.value)}
            />
          </Field>
          <Field
            label="الترتيب"
            hint="الأصغر يظهر أولًا."
            error={errors.sort_order}
          >
            <input
              className="ui-input"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="٠"
              value={values.sort_order}
              onChange={(event) => setField("sort_order", event.target.value)}
            />
          </Field>
          <Field label="وصف القسم" error={errors.description} wide>
            <textarea
              className="ui-textarea"
              rows={4}
              maxLength={2000}
              placeholder="اكتب وصفًا مختصرًا وواضحًا يظهر للزائر مع القسم."
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </Field>
        </div>
      </section>
      <fieldset className={`${styles.sourceFieldset} ${styles.coverFieldset}`}>
        <legend>
          <span>٠٢</span> الغلاف العمودي للقسم
        </legend>
        <p>صورة مستقلة تُستخدم كغلاف للقسم؛ لا تتغير عند إدارة صور الجاليري.</p>
        <div className={styles.sourceChoices}>
          <label
            className={
              values.cover_image_source_type === "none"
                ? styles.sourceChoiceActive
                : ""
            }
          >
            <input
              type="radio"
              name="cover-source"
              checked={values.cover_image_source_type === "none"}
              onChange={() => setCoverSource("none")}
            />
            <strong>بدون غلاف</strong>
            <small>يمكن إضافته أو تغييره لاحقًا.</small>
          </label>
          <label
            className={
              values.cover_image_source_type === "file"
                ? styles.sourceChoiceActive
                : ""
            }
          >
            <input
              type="radio"
              name="cover-source"
              checked={values.cover_image_source_type === "file"}
              onChange={() => setCoverSource("file")}
            />
            <strong>رفع غلاف</strong>
            <small>JPEG أو PNG أو WEBP أو AVIF حتى ١٠MB.</small>
          </label>
          <label
            className={
              values.cover_image_source_type === "url"
                ? styles.sourceChoiceActive
                : ""
            }
          >
            <input
              type="radio"
              name="cover-source"
              checked={values.cover_image_source_type === "url"}
              onChange={() => setCoverSource("url")}
            />
            <strong>رابط غلاف</strong>
            <small>رابط مباشر أو مسار موثوق يبدأ بـ /.</small>
          </label>
        </div>
        {values.cover_image_source_type === "file" && (
          <div className={styles.uploadBox}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
              onChange={(event) => setCoverFile(event.target.files?.[0])}
            />
            <span>
              {files.cover_image_file
                ? files.cover_image_file.name
                : record?.cover_image_source_type === "file"
                  ? "سيبقى الغلاف الحالي ما لم تختر صورة جديدة."
                  : "اختر ملف الغلاف من جهازك."}
            </span>
            {files.cover_image_file && (
              <button type="button" onClick={() => setCoverFile(undefined)}>
                إزالة الملف
              </button>
            )}
            {errors.cover_image_file?.[0] && (
              <em role="alert">{errors.cover_image_file[0]}</em>
            )}
          </div>
        )}
        {values.cover_image_source_type === "url" && (
          <div className={styles.formGrid}>
            <Field label="رابط الغلاف *" error={errors.cover_image_url} wide>
              <input
                className="ui-input"
                dir="ltr"
                type="url"
                placeholder="https://example.com/portrait-cover.webp"
                value={values.cover_image_url}
                onChange={(event) =>
                  setField("cover_image_url", event.target.value)
                }
              />
            </Field>
          </div>
        )}
        {values.cover_image_source_type !== "none" && (
          <div className={styles.formGrid}>
            <Field
              label="الوصف البديل للغلاف *"
              error={errors.cover_alt_text}
              wide
            >
              <input
                className="ui-input"
                maxLength={500}
                placeholder="وصف موجز للغلاف العمودي"
                value={values.cover_alt_text}
                onChange={(event) =>
                  setField("cover_alt_text", event.target.value)
                }
              />
            </Field>
          </div>
        )}
        {activeCoverPreview && (
          <div className={styles.coverPreview}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeCoverPreview}
              alt={values.cover_alt_text || "معاينة غلاف القسم"}
            />
            <div>
              <strong>معاينة الغلاف</strong>
              <small>يُحفظ الغلاف مستقلًا عن صور الجاليري.</small>
              <button type="button" onClick={() => setCoverSource("none")}>
                إزالة الغلاف
              </button>
            </div>
          </div>
        )}
      </fieldset>
      <fieldset className={styles.sourceFieldset}>
        <legend>
          <span>٠٣</span> صور الجاليري {editing ? "(اختياري)" : ""}
        </legend>
        <p className={styles.dialogIntro}>
          {editing
            ? "أضف صورًا جديدة إلى الجاليري مع حفظ التعديلات الحالية."
            : "اختر أي عدد من الصور؛ تحفظ أول دفعة مع القسم ثم تكتمل بقية الصور تلقائيًا."}
        </p>
        <div className={styles.galleryUploadBox}>
          <input
            key={galleryInputKey}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
            disabled={submitting}
            onChange={(event) => setGalleryFiles(event.target.files)}
          />
          <strong>
            {selectedGalleryFiles.length
              ? `${formatArabicNumber(selectedGalleryFiles.length)} صورة محددة للجاليري`
              : "اختر صور الجاليري من جهازك"}
          </strong>
          <small>
            JPEG أو PNG أو WEBP أو AVIF، وبحد أقصى ١٠MB للصورة الواحدة. الرفع
            يتم في دفعات من{" "}
            {formatArabicNumber(hadithCardGalleryUploadBatchSize)} صور.
          </small>
          {selectedGalleryFiles.length > 0 && (
            <span>
              {selectedGalleryFiles
                .slice(0, 3)
                .map((file) => file.name)
                .join("، ")}
              {selectedGalleryFiles.length > 3 ? "، …" : ""}
            </span>
          )}
          {selectedGalleryFiles.length > 0 && (
            <button
              type="button"
              disabled={submitting}
              onClick={clearGalleryFiles}
            >
              إزالة الصور المختارة
            </button>
          )}
          {errors.gallery_files?.[0] && (
            <em role="alert">{errors.gallery_files[0]}</em>
          )}
        </div>
        {galleryProgress && (
          <div className={styles.uploadProgress} role="status">
            <div>
              <strong>
                {galleryProgress.batch > 0
                  ? `اكتملت الدفعة ${formatArabicNumber(galleryProgress.batch)} من ${formatArabicNumber(galleryProgress.batches)}`
                  : "جارٍ تجهيز الرفع"}
              </strong>
              <span>
                {formatArabicNumber(galleryProgress.completed)} /{" "}
                {formatArabicNumber(galleryProgress.total)} صورة
              </span>
            </div>
            <progress
              max={galleryProgress.total}
              value={galleryProgress.completed}
            />
          </div>
        )}
      </fieldset>
      <section
        className={styles.formSection}
        aria-labelledby="section-publishing-data"
      >
        <div className={styles.formSectionHeading}>
          <span>٠٤</span>
          <div>
            <strong id="section-publishing-data">الظهور والنشر</strong>
            <small>تحكّم في ظهور القسم للزوار وتقديمه في الواجهة.</small>
          </div>
        </div>
        <div className={styles.optionRow}>
          <label className={styles.publishToggle}>
            <input
              type="checkbox"
              checked={values.is_featured}
              onChange={(event) =>
                setField("is_featured", event.target.checked)
              }
            />
            <span>
              <strong>تمييز في الواجهة</strong>
              <small>يُقدَّم ضمن أقسام الصفحة الرئيسية عند توفره.</small>
            </span>
          </label>
          <PublicationFields
            values={values}
            setField={setField}
            errors={errors}
          />
        </div>
      </section>
      <div className={styles.dialogActions}>
        <Button variant="secondary" disabled={submitting} onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={submitting}>
          {editing ? "حفظ التعديلات" : "إضافة القسم"}
        </Button>
      </div>
    </form>
  );
}

function CardEditor({
  project,
  record,
  onSaved,
  onCancel,
}: {
  project: HadithCardProject;
  record?: HadithCard | undefined;
  onSaved: (card: HadithCard, created: boolean) => void;
  onCancel: () => void;
}) {
  const editing = Boolean(record);
  const nextSortOrder =
    Math.max(0, ...project.cards.map((card) => card.sort_order)) + 1;
  const [values, setValues] = useState<HadithCardFormValues>(
    record
      ? cardToHadithCardForm(record)
      : emptyHadithCardForm(project.id, String(nextSortOrder)),
  );
  const [files, setFiles] = useState<HadithCardFormFiles>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<Key extends keyof HadithCardFormValues>(
    key: Key,
    value: HadithCardFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validateHadithCardForm(values, files, record);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setGlobalError("راجع بيانات الصورة ومصدرها قبل الحفظ.");
      return;
    }

    setSubmitting(true);
    setErrors({});
    setGlobalError(null);
    try {
      const result = record
        ? await updateHadithCard(record.id, values, files)
        : await createHadithCard(values, files);
      onSaved(result.data, !editing);
    } catch (reason) {
      if (reason instanceof HadithCardsClientError && reason.fieldErrors) {
        setErrors(reason.fieldErrors);
      }
      setGlobalError(
        reason instanceof Error ? reason.message : "تعذر حفظ الصورة.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className={styles.dialogForm}
      dir="rtl"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      {globalError && (
        <Alert variant="error" title="تعذّر الحفظ">
          {globalError}
        </Alert>
      )}
      <p className={styles.dialogIntro}>
        الصورة ستُضاف إلى قسم <strong>{project.title}</strong>.
      </p>
      <div className={styles.formGrid}>
        <Field label="عنوان الصورة (اختياري)" error={errors.title} wide>
          <input
            className="ui-input"
            autoFocus
            maxLength={255}
            value={values.title}
            onChange={(event) => setField("title", event.target.value)}
          />
        </Field>
        <Field label="الوصف البديل للصورة *" error={errors.alt_text} wide>
          <input
            className="ui-input"
            maxLength={255}
            placeholder="وصف موجز يشرح محتوى الصورة"
            value={values.alt_text}
            onChange={(event) => setField("alt_text", event.target.value)}
          />
        </Field>
        <Field label="ترتيب الصورة" error={errors.sort_order}>
          <input
            className="ui-input"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={values.sort_order}
            onChange={(event) => setField("sort_order", event.target.value)}
          />
        </Field>
      </div>

      <fieldset className={styles.sourceFieldset}>
        <legend>مصدر الصورة *</legend>
        <div className={styles.sourceChoices}>
          <label
            className={
              values.image_source_type === "file"
                ? styles.sourceChoiceActive
                : ""
            }
          >
            <input
              type="radio"
              name="image-source"
              checked={values.image_source_type === "file"}
              onChange={() => setField("image_source_type", "file")}
            />
            <strong>رفع صورة</strong>
            <small>JPEG أو PNG أو WEBP أو AVIF حتى ١٠MB.</small>
          </label>
          <label
            className={
              values.image_source_type === "url"
                ? styles.sourceChoiceActive
                : ""
            }
          >
            <input
              type="radio"
              name="image-source"
              checked={values.image_source_type === "url"}
              onChange={() => setField("image_source_type", "url")}
            />
            <strong>رابط صورة</strong>
            <small>رابط HTTPS أو مسار موثوق يبدأ بـ /.</small>
          </label>
        </div>
        {values.image_source_type === "file" ? (
          <div className={styles.uploadBox}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setFiles(file ? { image_file: file } : {});
                setErrors((current) => {
                  const next = { ...current };
                  delete next.image_file;
                  return next;
                });
              }}
            />
            <span>
              {files.image_file
                ? files.image_file.name
                : record?.image_source_type === "file"
                  ? "ستبقى الصورة الحالية ما لم تختر صورة جديدة."
                  : "اختر ملف الصورة من جهازك."}
            </span>
            {files.image_file && (
              <button type="button" onClick={() => setFiles({})}>
                إزالة الملف
              </button>
            )}
            {errors.image_file?.[0] && (
              <em role="alert">{errors.image_file[0]}</em>
            )}
          </div>
        ) : (
          <Field label="رابط الصورة *" error={errors.image_url}>
            <input
              className="ui-input"
              dir="ltr"
              type="url"
              placeholder="https://example.com/card.webp"
              value={values.image_url}
              onChange={(event) => setField("image_url", event.target.value)}
            />
          </Field>
        )}
      </fieldset>

      <PublicationFields values={values} setField={setField} errors={errors} />
      <div className={styles.dialogActions}>
        <Button variant="secondary" disabled={submitting} onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={submitting}>
          {editing ? "حفظ الصورة" : "إضافة الصورة"}
        </Button>
      </div>
    </form>
  );
}

function GalleryUploader({
  project,
  onBatchUploaded,
  onFinished,
  onCancel,
}: {
  project: HadithCardProject;
  onBatchUploaded: (
    result: HadithCardBulkMutation,
    completed: number,
  ) => void | Promise<void>;
  onFinished: (result: HadithCardBulkMutation) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{
    completed: number;
    total: number;
    batch: number;
    batches: number;
  } | null>(null);

  function selectFiles(nextFiles: FileList | null) {
    const selected = Array.from(nextFiles ?? []);
    setFiles(selected);
    setProgress(null);
    setGlobalError(null);
    setErrors(validateHadithCardGalleryFiles(selected));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading) return;
    const nextErrors = validateHadithCardGalleryFiles(files);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setUploading(true);
    setErrors({});
    setGlobalError(null);
    setProgress({
      completed: 0,
      total: files.length,
      batch: 0,
      batches: Math.ceil(files.length / hadithCardGalleryUploadBatchSize),
    });
    try {
      const result = await uploadHadithCardGallery(project.id, files, {
        onProgress: setProgress,
        onBatchComplete: async (batchResult, batchProgress) => {
          await onBatchUploaded(batchResult, batchProgress.completed);
          // Keep only the still-unuploaded files in the picker. If a later
          // batch fails, retrying never duplicates the batches that succeeded.
          setFiles(files.slice(batchProgress.completed));
        },
      });
      await onFinished(result);
      setFiles([]);
      onCancel();
    } catch (reason) {
      setGlobalError(
        reason instanceof Error
          ? reason.message
          : "تعذر رفع الدفعة الحالية من صور الجاليري.",
      );
    } finally {
      setUploading(false);
    }
  }

  const sampleNames = files
    .slice(0, 3)
    .map((file) => file.name)
    .join("، ");

  return (
    <form
      className={styles.dialogForm}
      dir="rtl"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      {globalError && (
        <Alert variant="error" title="تعذّر إكمال الرفع">
          {globalError}
          {progress && progress.completed > 0 && (
            <span className={styles.partialUploadNote}>
              تم رفع {formatArabicNumber(progress.completed)} من أصل{" "}
              {formatArabicNumber(progress.total)} صورة؛ بقيت الصور غير المرفوعة
              في القائمة ويمكنك إعادة المحاولة دون تكرار الصور الناجحة.
            </span>
          )}
        </Alert>
      )}
      <p className={styles.dialogIntro}>
        اختر أي عدد من صور الجاليري لقسم <strong>{project.title}</strong>. يرفع
        النظام الاختيار تلقائيًا في دفعات متتابعة من{" "}
        {formatArabicNumber(hadithCardGalleryUploadBatchSize)} صور لحماية الرفع
        على الخادم.
      </p>
      <div className={styles.galleryUploadBox}>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
          disabled={uploading}
          onChange={(event) => selectFiles(event.target.files)}
        />
        <strong>
          {files.length
            ? `${formatArabicNumber(files.length)} صورة محددة للجاليري`
            : "اختر صور الجاليري من جهازك"}
        </strong>
        <small>
          JPEG أو PNG أو WEBP أو AVIF، وبحد أقصى ١٠MB للصورة الواحدة.
        </small>
        {sampleNames && (
          <span>
            {sampleNames}
            {files.length > 3 ? "، …" : ""}
          </span>
        )}
        {errors.gallery_files?.[0] && (
          <em role="alert">{errors.gallery_files[0]}</em>
        )}
      </div>
      {progress && (
        <div className={styles.uploadProgress} role="status">
          <div>
            <strong>
              {progress.batch > 0
                ? `اكتملت الدفعة ${formatArabicNumber(progress.batch)} من ${formatArabicNumber(progress.batches)}`
                : "جارٍ تجهيز الرفع"}
            </strong>
            <span>
              {formatArabicNumber(progress.completed)} /{" "}
              {formatArabicNumber(progress.total)} صورة
            </span>
          </div>
          <progress max={progress.total} value={progress.completed} />
        </div>
      )}
      <div className={styles.dialogActions}>
        <Button variant="secondary" disabled={uploading} onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={uploading} disabled={files.length === 0}>
          {uploading ? "جارٍ رفع صور الجاليري" : "بدء الرفع"}
        </Button>
      </div>
    </form>
  );
}

export function HadithCardsWorkspace({
  initialProjectPage,
  initialSelectedProjectId,
  initialSelectedProject,
  initialNotice = null,
}: {
  initialProjectPage: HadithCardProjectPage;
  initialSelectedProjectId?: string | undefined;
  initialSelectedProject?: HadithCardProject | undefined;
  initialNotice?: string | null | undefined;
}) {
  const router = useRouter();
  const initialProjects = initialSelectedProject
    ? initialProjectPage.data.map((project) =>
        project.id === initialSelectedProject.id
          ? mergeProject(project, initialSelectedProject)
          : project,
      )
    : initialProjectPage.data;
  const requestedInitialId = initialSelectedProjectId;
  const resolvedInitialId =
    requestedInitialId &&
    initialProjects.some((project) => project.id === requestedInitialId)
      ? requestedInitialId
      : (initialProjects[0]?.id ?? null);
  const [projects, setProjects] = useState(initialProjects);
  const [stats, setStats] = useState<ProjectStats>(initialProjectPage.stats);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    resolvedInitialId,
  );
  const [details, setDetails] = useState<Record<string, HadithCardProject>>(
    () =>
      initialSelectedProject && resolvedInitialId === initialSelectedProject.id
        ? { [initialSelectedProject.id]: initialSelectedProject }
        : {},
  );
  const [detailError, setDetailError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | HadithCardStatus>("all");
  const [cardSearch, setCardSearch] = useState("");
  const [cardStatus, setCardStatus] = useState<"all" | HadithCardStatus>("all");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(initialNotice);

  const selectedProject = selectedProjectId
    ? (details[selectedProjectId] ??
      projects.find((project) => project.id === selectedProjectId) ??
      null)
    : null;
  const selectedProjectHasDetail = Boolean(
    selectedProjectId && details[selectedProjectId],
  );
  const detailLoading = Boolean(
    selectedProjectId && !selectedProjectHasDetail && !detailError,
  );
  const filteredProjects = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("ar");
    return projects.filter((project) => {
      const matchesTerm =
        !term ||
        [project.title, project.slug, project.eyebrow, project.description]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase("ar").includes(term));
      return matchesTerm && (status === "all" || project.status === status);
    });
  }, [projects, search, status]);

  useEffect(() => {
    replaceSelectedProjectInUrl(selectedProjectId);
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId || selectedProjectHasDetail || detailError) return;
    const controller = new AbortController();
    let active = true;
    void getHadithCardProject(selectedProjectId, controller.signal)
      .then((project) => {
        if (!active) return;
        setDetails((current) => ({ ...current, [project.id]: project }));
        setProjects((current) =>
          current.map((item) =>
            item.id === project.id ? mergeProject(item, project) : item,
          ),
        );
      })
      .catch((reason: unknown) => {
        if (
          active &&
          !(reason instanceof DOMException && reason.name === "AbortError")
        ) {
          setDetailError(
            reason instanceof Error ? reason.message : "تعذر تحميل صور القسم.",
          );
        }
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [detailError, selectedProjectHasDetail, selectedProjectId]);

  function selectProject(projectId: string) {
    setSelectedProjectId(projectId);
    setDetailError(null);
    setActionError(null);
  }

  function applyProjectSaved(
    project: HadithCardProject,
    created: boolean,
    noticeOverride?: string,
  ) {
    const previous = projects.find((item) => item.id === project.id) ?? null;
    setProjects((current) => {
      const next = current.some((item) => item.id === project.id)
        ? current.map((item) =>
            item.id === project.id ? mergeProject(item, project) : item,
          )
        : [project, ...current];
      return next.toSorted(
        (left, right) =>
          Number(right.is_featured) - Number(left.is_featured) ||
          left.sort_order - right.sort_order ||
          left.title.localeCompare(right.title, "ar"),
      );
    });
    setDetails((current) => ({
      ...current,
      // Mutation responses are fetched with the full section detail. Use that
      // authoritative gallery rather than retaining a stale list preview.
      [project.id]: project,
    }));
    setStats((current) => ({
      ...updateProjectStats(current, previous, project),
      cards: Math.max(
        0,
        current.cards + project.cards_count - (previous?.cards_count ?? 0),
      ),
    }));
    setSelectedProjectId(project.id);
    setEditor(null);
    setNotice(
      noticeOverride ??
        (created
          ? "تمت إضافة القسم، ويمكنك الآن إدارة صور الجاليري داخله."
          : "تم حفظ تعديلات القسم."),
    );
    router.refresh();
  }

  function applyCardSaved(card: HadithCard, created: boolean) {
    const projectId = card.hadith_card_project_id;
    const previous = details[projectId]?.cards.find(
      (item) => item.id === card.id,
    );
    const cardDelta = previous ? 0 : 1;
    const publishedDelta =
      (card.status === "published" ? 1 : 0) -
      (previous?.status === "published" ? 1 : 0);
    const patch = (project: HadithCardProject) => {
      if (project.id !== projectId) return project;
      const cards = sortCards(
        previous
          ? project.cards.map((item) => (item.id === card.id ? card : item))
          : [...project.cards, card],
      );
      return {
        ...updateProjectCardCounts(project, cardDelta, publishedDelta),
        cards,
      };
    };

    setDetails((current) => {
      const currentProject = current[projectId];
      return currentProject
        ? { ...current, [projectId]: patch(currentProject) }
        : current;
    });
    setProjects((current) => current.map(patch));
    if (cardDelta) {
      setStats((current) => ({ ...current, cards: current.cards + cardDelta }));
    }
    setEditor(null);
    setNotice(
      created ? "تمت إضافة الصورة إلى القسم." : "تم حفظ تعديلات الصورة.",
    );
    router.refresh();
  }

  function applyGalleryBatch(
    project: HadithCardProject,
    result: HadithCardBulkMutation,
  ) {
    const incomingCards = result.data.cards;
    const cardsDelta = result.data.created_count;
    const publishedDelta = incomingCards.filter(
      (card) => card.status === "published",
    ).length;
    const patch = (item: HadithCardProject) => {
      if (item.id !== project.id) return item;
      const known = new Map(item.cards.map((card) => [card.id, card]));
      incomingCards.forEach((card) => known.set(card.id, card));
      return {
        ...updateProjectCardCounts(item, cardsDelta, publishedDelta),
        cards: sortCards([...known.values()]),
      };
    };

    setDetails((current) => {
      const currentProject = current[project.id];
      return currentProject
        ? { ...current, [project.id]: patch(currentProject) }
        : current;
    });
    setProjects((current) => current.map(patch));
    setStats((current) => ({
      ...current,
      cards: current.cards + cardsDelta,
    }));
  }

  async function applyGalleryFinished(
    project: HadithCardProject,
    result: HadithCardBulkMutation,
  ) {
    let detailWasRefreshed = false;
    try {
      const fresh = await getHadithCardProject(project.id);
      setDetails((current) => ({ ...current, [fresh.id]: fresh }));
      setProjects((current) =>
        current.map((item) =>
          item.id === fresh.id ? mergeProject(item, fresh) : item,
        ),
      );
      detailWasRefreshed = true;
    } catch {
      // The successful batches remain reflected locally. The page can still be
      // refreshed later if the lightweight detail read is temporarily unavailable.
    }

    setNotice(
      `تم رفع ${formatArabicNumber(result.data.created_count)} صورة إلى الجاليري${detailWasRefreshed ? "." : "؛ ستتحدث القائمة كاملة عند إعادة التحميل."}`,
    );
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setActionError(null);
    try {
      if (deleteTarget.kind === "project") {
        const target = deleteTarget.record;
        await deleteHadithCardProject(target.id);
        setProjects((current) =>
          current.filter((item) => item.id !== target.id),
        );
        setDetails((current) => {
          const next = { ...current };
          delete next[target.id];
          return next;
        });
        setStats((current) => ({
          ...updateProjectStats(current, target, null),
          cards: Math.max(0, current.cards - target.cards_count),
        }));
        if (selectedProjectId === target.id) {
          const next =
            projects.find((item) => item.id !== target.id)?.id ?? null;
          setSelectedProjectId(next);
        }
        setNotice("تم حذف القسم وصور الجاليري المرتبطة به نهائيًا.");
      } else {
        const { project, record } = deleteTarget;
        await deleteHadithCard(record.id);
        const publishedDelta = record.status === "published" ? -1 : 0;
        const patch = (item: HadithCardProject) => {
          if (item.id !== project.id) return item;
          return {
            ...updateProjectCardCounts(item, -1, publishedDelta),
            cards: item.cards.filter((card) => card.id !== record.id),
          };
        };
        setDetails((current) => {
          const currentProject = current[project.id];
          return currentProject
            ? { ...current, [project.id]: patch(currentProject) }
            : current;
        });
        setProjects((current) => current.map(patch));
        setStats((current) => ({
          ...current,
          cards: Math.max(0, current.cards - 1),
        }));
        setNotice("تم حذف الصورة نهائيًا.");
      }
      setDeleteTarget(null);
      router.refresh();
    } catch (reason) {
      setActionError(
        reason instanceof Error ? reason.message : "تعذر حذف العنصر المطلوب.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const cards = selectedProject?.cards ?? emptyCards;
  const filteredCards = useMemo(() => {
    const term = cardSearch.trim().toLocaleLowerCase("ar");
    return cards.filter((card) => {
      const matchesTerm =
        !term ||
        [card.title, card.alt_text, card.slug]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase("ar").includes(term));
      return (
        matchesTerm && (cardStatus === "all" || card.status === cardStatus)
      );
    });
  }, [cardSearch, cardStatus, cards]);

  return (
    <main className={styles.page} dir="rtl">
      <section
        className={styles.metrics}
        aria-label="ملخص الأقسام وصور الجاليري"
      >
        <article>
          <span>كل الأقسام</span>
          <strong>{formatArabicNumber(stats.total)}</strong>
          <small>أقسام مستقلة للمحتوى</small>
        </article>
        <article>
          <span>منشور للعامة</span>
          <strong>{formatArabicNumber(stats.published)}</strong>
          <small>أقسام متاحة الآن</small>
        </article>
        <article>
          <span>قيد الإعداد</span>
          <strong>{formatArabicNumber(stats.drafts)}</strong>
          <small>أقسام غير ظاهرة للزائر</small>
        </article>
        <article>
          <span>إجمالي صور الجاليري</span>
          <strong>{formatArabicNumber(stats.cards)}</strong>
          <small>صور موزعة داخل الأقسام</small>
        </article>
      </section>

      {notice && (
        <div className={styles.notice} role="status">
          <span>✓</span>
          {notice}
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="إخفاء التنبيه"
          >
            ×
          </button>
        </div>
      )}
      {actionError && (
        <Alert variant="error" title="تعذّر تنفيذ الإجراء">
          {actionError}
        </Alert>
      )}

      <section
        className={styles.workspace}
        aria-label="تنظيم الأقسام وصور الجاليري"
      >
        <Card className={styles.projectsPanel ?? ""}>
          <div className={styles.panelHeading}>
            <div>
              <span className={styles.kicker}>الأقسام</span>
              <h2>الأقسام</h2>
              <p>اختر قسمًا لإدارة صور الجاليري من المكان نفسه.</p>
            </div>
            <Button onClick={() => setEditor({ kind: "project" })}>
              + قسم
            </Button>
          </div>
          <div className={styles.filters}>
            <label className={styles.searchField}>
              <span className="sr-only">بحث في الأقسام</span>
              <input
                className="ui-input"
                type="search"
                placeholder="ابحث بعنوان القسم أو وصفه"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <select
              className="ui-input"
              aria-label="حالة النشر"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "all" | HadithCardStatus)
              }
            >
              <option value="all">كل الحالات</option>
              {hadithCardStatuses.map((item) => (
                <option key={item} value={item}>
                  {hadithCardStatusLabel(item)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.projectsList}>
            {filteredProjects.length === 0 ? (
              <EmptyState
                title={
                  projects.length ? "لا توجد نتائج مطابقة" : "لا توجد أقسام بعد"
                }
                description={
                  projects.length
                    ? "غيّر كلمات البحث أو الفلاتر للوصول إلى قسم آخر."
                    : "أنشئ أول قسم ثم أضف صور الجاليري داخله."
                }
                action={
                  projects.length === 0 ? (
                    <Button onClick={() => setEditor({ kind: "project" })}>
                      إضافة أول قسم
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`${styles.projectRow} ${project.id === selectedProjectId ? styles.projectRowActive : ""}`}
                  onClick={() => selectProject(project.id)}
                  aria-pressed={project.id === selectedProjectId}
                >
                  <span
                    className={`${styles.projectMark} ${project.accent === "blue" ? styles.projectMarkBlue : ""}`}
                    aria-hidden="true"
                  >
                    {project.title.slice(0, 1)}
                  </span>
                  <span className={styles.projectRowCopy}>
                    <strong>{project.title}</strong>
                    <small>
                      {project.eyebrow || "قسم من البطاقات الحديثية"}
                    </small>
                    <span>
                      {formatArabicNumber(project.cards_count)} صورة
                      {project.is_featured ? " · مميز" : ""}
                    </span>
                  </span>
                  <Badge variant={statusVariant(project.status)}>
                    {hadithCardStatusLabel(project.status)}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </Card>

        {(selectedProject || projects.length > 0) && (
          <Card className={styles.detailPanel ?? ""}>
            {!selectedProject ? (
              <EmptyState
                title="اختر قسمًا للبدء"
                description="من القائمة ستظهر صور الجاليري وإجراءات القسم المختار."
                action={
                  <Button onClick={() => setEditor({ kind: "project" })}>
                    إضافة قسم
                  </Button>
                }
              />
            ) : detailLoading ? (
              <div className={styles.detailLoading} role="status">
                <Spinner label="جارٍ تحميل صور الجاليري" />
                <span>جارٍ تحميل صور الجاليري…</span>
              </div>
            ) : detailError ? (
              <div className={styles.detailError} role="alert">
                <strong>تعذّر تحميل صور الجاليري</strong>
                <span>{detailError}</span>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDetailError(null);
                    setDetails((current) => {
                      const next = { ...current };
                      if (selectedProjectId) delete next[selectedProjectId];
                      return next;
                    });
                  }}
                >
                  إعادة المحاولة
                </Button>
              </div>
            ) : (
              <>
                <div className={styles.detailHeader}>
                  <div className={styles.detailTitle}>
                    <span
                      className={`${styles.detailMark} ${selectedProject.accent === "blue" ? styles.projectMarkBlue : ""}`}
                      aria-hidden="true"
                    >
                      ۞
                    </span>
                    <div>
                      <div className={styles.detailMeta}>
                        <Badge variant={statusVariant(selectedProject.status)}>
                          {hadithCardStatusLabel(selectedProject.status)}
                        </Badge>
                        {selectedProject.is_featured && (
                          <span>مميز في الواجهة</span>
                        )}
                      </div>
                      <h2>{selectedProject.title}</h2>
                      <p>
                        {selectedProject.description ||
                          "أضف وصفًا تعريفيًا ليظهر مع القسم في واجهة الموقع."}
                      </p>
                    </div>
                  </div>
                  <div className={styles.detailActions}>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setEditor({ kind: "project", record: selectedProject })
                      }
                    >
                      تعديل القسم
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        setDeleteTarget({
                          kind: "project",
                          record: selectedProject,
                        })
                      }
                    >
                      حذف
                    </Button>
                  </div>
                </div>

                <div className={styles.cardsToolbar}>
                  <div>
                    <h3>صور الجاليري</h3>
                    <p>
                      {formatArabicNumber(cards.length)} صورة داخل هذا القسم
                      {selectedProject.published_cards_count
                        ? `، منها ${formatArabicNumber(selectedProject.published_cards_count)} منشورة.`
                        : "."}
                    </p>
                  </div>
                  <div className={styles.cardsToolbarActions}>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setEditor({ kind: "gallery", project: selectedProject })
                      }
                    >
                      رفع صور الجاليري
                    </Button>
                    <Button
                      onClick={() =>
                        setEditor({ kind: "card", project: selectedProject })
                      }
                    >
                      + صورة جديدة
                    </Button>
                  </div>
                </div>

                {cards.length > 0 && (
                  <div className={styles.cardsFilters}>
                    <label>
                      <span className="sr-only">بحث في صور الجاليري</span>
                      <input
                        className="ui-input"
                        type="search"
                        placeholder="ابحث في صور الجاليري"
                        value={cardSearch}
                        onChange={(event) => setCardSearch(event.target.value)}
                      />
                    </label>
                    <select
                      className="ui-input"
                      aria-label="حالة صور الجاليري"
                      value={cardStatus}
                      onChange={(event) =>
                        setCardStatus(
                          event.target.value as "all" | HadithCardStatus,
                        )
                      }
                    >
                      <option value="all">كل حالات الصور</option>
                      {hadithCardStatuses.map((item) => (
                        <option key={item} value={item}>
                          {hadithCardStatusLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {cards.length === 0 ? (
                  <EmptyState
                    title="لا توجد صور جاليري داخل القسم"
                    description="أضف صورة واحدة أو ارفع مجموعة صور من جهازك."
                    action={
                      <Button
                        onClick={() =>
                          setEditor({ kind: "card", project: selectedProject })
                        }
                      >
                        إضافة صورة
                      </Button>
                    }
                  />
                ) : filteredCards.length === 0 ? (
                  <EmptyState
                    title="لا توجد صور مطابقة"
                    description="غيّر البحث أو حالة النشر لإظهار صور أخرى."
                    action={
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCardSearch("");
                          setCardStatus("all");
                        }}
                      >
                        مسح الفلاتر
                      </Button>
                    }
                  />
                ) : (
                  <div className={styles.cardsGrid}>
                    {filteredCards.map((card) => {
                      const image = previewUrl(card);
                      return (
                        <article key={card.id} className={styles.cardItem}>
                          <div className={styles.cardVisual}>
                            {image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={image} alt={card.alt_text} />
                            ) : (
                              <span aria-hidden="true">۞</span>
                            )}
                            <Badge variant={statusVariant(card.status)}>
                              {hadithCardStatusLabel(card.status)}
                            </Badge>
                          </div>
                          <div className={styles.cardCopy}>
                            <strong>{card.title || card.alt_text}</strong>
                            <small>{card.alt_text}</small>
                            <span>
                              ترتيب {formatArabicNumber(card.sort_order)}
                            </span>
                          </div>
                          <div className={styles.cardActions}>
                            <Button
                              variant="secondary"
                              onClick={() =>
                                setEditor({
                                  kind: "card",
                                  project: selectedProject,
                                  record: card,
                                })
                              }
                            >
                              تعديل
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() =>
                                setDeleteTarget({
                                  kind: "card",
                                  project: selectedProject,
                                  record: card,
                                })
                              }
                            >
                              حذف
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </Card>
        )}
      </section>

      <Dialog
        open={editor?.kind === "project"}
        onOpenChange={(open) => !open && setEditor(null)}
        title={
          editor?.kind === "project" && editor.record
            ? "تعديل القسم"
            : "إضافة قسم"
        }
        size="wide"
      >
        {editor?.kind === "project" && (
          <ProjectEditor
            key={editor.record?.id ?? "new-project"}
            record={editor.record}
            onCancel={() => setEditor(null)}
            onSaved={applyProjectSaved}
          />
        )}
      </Dialog>

      <Dialog
        open={editor?.kind === "card"}
        onOpenChange={(open) => !open && setEditor(null)}
        title={
          editor?.kind === "card" && editor.record
            ? "تعديل صورة الجاليري"
            : "إضافة صورة للجاليري"
        }
        size="wide"
      >
        {editor?.kind === "card" && (
          <CardEditor
            key={editor.record?.id ?? `new-card-${editor.project.id}`}
            project={editor.project}
            record={editor.record}
            onCancel={() => setEditor(null)}
            onSaved={applyCardSaved}
          />
        )}
      </Dialog>

      <Dialog
        open={editor?.kind === "gallery"}
        onOpenChange={(open) => !open && setEditor(null)}
        title="إضافة صور للجاليري"
        size="wide"
      >
        {editor?.kind === "gallery" && (
          <GalleryUploader
            key={`gallery-${editor.project.id}`}
            project={editor.project}
            onCancel={() => setEditor(null)}
            onBatchUploaded={async (result) => {
              applyGalleryBatch(editor.project, result);
            }}
            onFinished={async (result) => {
              await applyGalleryFinished(editor.project, result);
            }}
          />
        )}
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
        title={
          deleteTarget?.kind === "project" ? "حذف القسم" : "حذف صورة الجاليري"
        }
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={() => void confirmDelete()}
            >
              حذف نهائيًا
            </Button>
          </div>
        }
      >
        <div className={styles.deleteCopy} dir="rtl">
          <strong>
            {deleteTarget?.kind === "project"
              ? `سيُحذف قسم «${deleteTarget.record.title}» وكل صور الجاليري داخله.`
              : `سيتم حذف صورة «${deleteTarget?.kind === "card" ? deleteTarget.record.title || deleteTarget.record.alt_text : ""}» نهائيًا.`}
          </strong>
          <p>لا يمكن التراجع عن هذا الإجراء بعد التأكيد.</p>
        </div>
      </Dialog>
    </main>
  );
}
