"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert, Button, Card } from "@/shared/components/ui";
import { formatArabicFileSize } from "@/shared/lib/arabic-format";
import {
  createListeningSession,
  updateListeningSession,
} from "../application/listening.client";
import { validateListeningSessionForm } from "../application/listening.form";
import {
  emptyListeningSessionForm,
  listeningSessionToFormValues,
  type ListeningSeriesSummary,
  type ListeningSession,
  type ListeningSessionFormFiles,
  type ListeningSessionFormValues,
} from "../domain/listening.contracts";
import { ListeningField, ListeningSectionTitle } from "./listening-form-parts";
import styles from "./listening.module.css";

export function ListeningSessionForm({
  series,
  initial,
  defaultSeriesId,
  defaultSequenceNumber,
  lockedSeries = false,
  onSaved,
  onCancel,
  onDirtyChange,
  onSubmittingChange,
}: {
  series: ListeningSeriesSummary[];
  initial?: ListeningSession;
  defaultSeriesId?: string;
  defaultSequenceNumber?: number;
  lockedSeries?: boolean;
  onSaved?: (session: ListeningSession) => void;
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSubmittingChange?: (submitting: boolean) => void;
}) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [values, setValues] = useState<ListeningSessionFormValues>(
    initial
      ? listeningSessionToFormValues(initial)
      : {
          ...emptyListeningSessionForm,
          listening_series_id: defaultSeriesId ?? "",
          sequence_number: defaultSequenceNumber
            ? String(defaultSequenceNumber)
            : "",
        },
  );
  const [files, setFiles] = useState<ListeningSessionFormFiles>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof ListeningSessionFormValues>(
    field: K,
    value: ListeningSessionFormValues[K],
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
    const nextErrors = validateListeningSessionForm(values, files, initial);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setGlobalError("راجع بيانات المجلس ومصدر التسجيل قبل الحفظ.");
      return;
    }
    setSubmitting(true);
    onSubmittingChange?.(true);
    setErrors({});
    setGlobalError(null);
    try {
      const result = initial
        ? await updateListeningSession(initial.id, values, files)
        : await createListeningSession(values, files);
      if (onSaved) {
        onSaved(result.data);
        return;
      }
      router.replace(
        `/dashboard/listening/sessions/${result.data.id}?notice=${editing ? "updated" : "created"}`,
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
        reason instanceof Error ? reason.message : "تعذر حفظ المجلس.",
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
        <Alert variant="error" title="تعذر حفظ المجلس">
          {globalError}
        </Alert>
      )}

      <Card className={styles.formCard ?? ""}>
        <ListeningSectionTitle
          number="٠١"
          title="هوية المجلس"
          description="اربط المجلس بسلسلته وحدد ترتيبه والبيانات الظاهرة للزائر."
        />
        <div className={styles.formGrid}>
          <ListeningField
            label="السلسلة *"
            error={errors.listening_series_id}
            hint={
              lockedSeries ? "محددة من السلسلة المفتوحة حاليًا." : undefined
            }
          >
            <select
              className="ui-input"
              disabled={lockedSeries}
              value={values.listening_series_id}
              onChange={(event) =>
                setField("listening_series_id", event.target.value)
              }
            >
              <option value="">اختر السلسلة</option>
              {series.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </ListeningField>
          <ListeningField label="ترتيب المجلس *" error={errors.sequence_number}>
            <input
              className="ui-input"
              type="number"
              min="1"
              max="65535"
              value={values.sequence_number}
              onChange={(event) =>
                setField("sequence_number", event.target.value)
              }
            />
          </ListeningField>
          <ListeningField label="عنوان المجلس *" error={errors.title} wide>
            <input
              className="ui-input"
              maxLength={255}
              value={values.title}
              onChange={(event) => setField("title", event.target.value)}
            />
          </ListeningField>
          <ListeningField label="تاريخ المجلس *" error={errors.date_label}>
            <input
              className="ui-input"
              maxLength={100}
              value={values.date_label}
              placeholder="١٥ ربيع الأول ١٤٤٦هـ"
              onChange={(event) => setField("date_label", event.target.value)}
            />
          </ListeningField>
          <ListeningField
            label="المدة بالدقائق *"
            error={errors.duration_minutes}
          >
            <input
              className="ui-input"
              type="number"
              min="1"
              max="65535"
              value={values.duration_minutes}
              onChange={(event) =>
                setField("duration_minutes", event.target.value)
              }
            />
          </ListeningField>
          <ListeningField label="وصف المجلس *" error={errors.description} wide>
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
          title="التسجيل الصوتي"
          description="يمكن حفظ المجلس كمسودة بلا صوت، بينما يتطلب النشر ملفًا أو رابطًا صالحًا."
        />
        <div className={styles.choiceGrid}>
          {(
            [
              ["none", "بدون تسجيل", "مسودة لحين إضافة المصدر."],
              ["file", "ملف مرفوع", "ملف صوتي على خادم الموقع."],
              [
                "link",
                "رابط صوت مباشر",
                "رابط HTTPS مباشر لملف صوتي، وليس صفحة مشاهدة أو مشاركة.",
              ],
            ] as const
          ).map(([source, label, description]) => (
            <label
              key={source}
              className={`${styles.choiceCard} ${values.audio_source_type === source ? styles.choiceCardActive : ""}`}
            >
              <input
                type="radio"
                name="audio-source"
                checked={values.audio_source_type === source}
                onChange={() => setField("audio_source_type", source)}
              />
              <strong>{label}</strong>
              <small>{description}</small>
            </label>
          ))}
        </div>
        {errors.audio_source_type?.[0] && (
          <p className={styles.fieldError} role="alert">
            {errors.audio_source_type[0]}
          </p>
        )}

        {values.audio_source_type === "file" && (
          <div className={styles.uploadBox}>
            <input
              type="file"
              accept=".mp3,.m4a,.aac,.wav,.ogg,.oga,.opus,.webm,audio/*"
              onChange={(event) => {
                setFiles({ audio_file: event.target.files?.[0] });
                onDirtyChange?.(true);
              }}
            />
            <strong>
              {editing && initial?.audio_file_path
                ? "استبدال ملف التسجيل"
                : "اختر ملف التسجيل"}
            </strong>
            <small>
              MP3 أو M4A أو AAC أو WAV أو OGG أو OPUS أو WEBM بحد أقصى ١٠٠MB.
            </small>
            {files.audio_file && (
              <div className={styles.filePreview}>
                <div>
                  <strong>{files.audio_file.name}</strong>
                  <small>{formatArabicFileSize(files.audio_file.size)}</small>
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
            {errors.audio_file?.[0] && (
              <em role="alert">{errors.audio_file[0]}</em>
            )}
          </div>
        )}

        {values.audio_source_type === "link" && (
          <div className={styles.formGrid}>
            <ListeningField
              label="رابط التسجيل *"
              error={errors.audio_source_link}
              hint="رابط HTTPS مباشر ينتهي بـ MP3 أو M4A أو AAC أو WAV أو OGG أو OPUS أو WEBM. روابط صفحات المشاهدة والمشاركة غير مدعومة."
              wide
            >
              <input
                className="ui-input"
                type="url"
                dir="ltr"
                value={values.audio_source_link}
                placeholder="https://cdn.example.com/audio/lesson.mp3"
                onChange={(event) =>
                  setField("audio_source_link", event.target.value)
                }
              />
            </ListeningField>
          </div>
        )}
        {values.audio_source_type !== "none" && (
          <label className={styles.inlineSwitch}>
            <input
              type="checkbox"
              checked={values.audio_download_allowed}
              onChange={(event) =>
                setField("audio_download_allowed", event.target.checked)
              }
            />
            <span>السماح للزائر بتحميل التسجيل</span>
          </label>
        )}
      </Card>

      <Card className={styles.formCard ?? ""}>
        <ListeningSectionTitle
          number="٠٣"
          title="النشر"
          description="المجلس يبدأ كمسودة، ولا ينشر قبل إضافة مصدر صوتي."
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
              <strong>منشور للعامة</strong>
              <small>فعّل الخيار بعد اكتمال التسجيل والبيانات.</small>
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
                ? `/dashboard/listening/sessions/${initial.id}`
                : "/dashboard/listening/sessions"
            }
            className="ui-button ui-button--secondary ui-focus"
          >
            إلغاء
          </Link>
        )}
        <Button type="submit" loading={submitting} disabled={submitting}>
          {editing ? "حفظ التعديلات" : "إضافة المجلس"}
        </Button>
      </div>
    </form>
  );
}
