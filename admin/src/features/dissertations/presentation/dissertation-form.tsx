"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

import {
  createDissertation,
  updateDissertation,
} from "../application/dissertations.client";
import { validateDissertationForm } from "../application/dissertations.form";
import {
  dissertationToFormValues,
  emptyDissertationForm,
  type Dissertation,
  type DissertationFormFiles,
  type DissertationFormValues,
} from "../domain/dissertations.contracts";
import { formatArabicFileSize } from "@/shared/lib/arabic-format";
import { Alert, Button, Card } from "@/shared/components/ui";
import styles from "./dissertations.module.css";

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

export function DissertationForm({ initial }: { initial?: Dissertation }) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [values, setValues] = useState<DissertationFormValues>(
    initial ? dissertationToFormValues(initial) : { ...emptyDissertationForm },
  );
  const [files, setFiles] = useState<DissertationFormFiles>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof DissertationFormValues>(
    field: K,
    value: DissertationFormValues[K],
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
    const nextErrors = validateDissertationForm(values, files, initial);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setGlobalError("راجع الحقول والملف المحدد قبل الحفظ.");
      return;
    }
    setSubmitting(true);
    setErrors({});
    setGlobalError(null);
    try {
      const result = initial
        ? await updateDissertation(initial.id, values, files)
        : await createDissertation(values, files);
      router.replace(
        `/dashboard/dissertations/${result.data.id}?notice=${editing ? "updated" : "created"}`,
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
        reason instanceof Error ? reason.message : "تعذر حفظ الرسالة العلمية.",
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
        <Alert variant="error" title="تعذر حفظ الرسالة">
          {globalError}
        </Alert>
      )}

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠١"
          title="التعريف بالرسالة"
          description="العنوان والباحث والرابط الثابت المستخدم في الموقع العام."
        />
        <div className={styles.formGrid}>
          <Field label="عنوان الرسالة *" error={errors.title} wide>
            <input
              className="ui-input"
              value={values.title}
              maxLength={255}
              onChange={(event) => setField("title", event.target.value)}
            />
          </Field>
          <Field label="اسم الباحث *" error={errors.researcher_name}>
            <input
              className="ui-input"
              value={values.researcher_name}
              maxLength={255}
              onChange={(event) =>
                setField("researcher_name", event.target.value)
              }
            />
          </Field>
        </div>
      </Card>

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠٢"
          title="البيانات الأكاديمية"
          description="الحقول المستخدمة في الكرت والفلاتر وصفحة التفاصيل."
        />
        <div className={styles.formGrid}>
          <Field label="الجامعة" error={errors.university}>
            <input
              className="ui-input"
              value={values.university}
              maxLength={255}
              onChange={(event) => setField("university", event.target.value)}
            />
          </Field>
          <Field label="الكلية" error={errors.college}>
            <input
              className="ui-input"
              value={values.college}
              maxLength={255}
              onChange={(event) => setField("college", event.target.value)}
            />
          </Field>
          <Field label="السنة الهجرية" error={errors.year}>
            <input
              className="ui-input"
              type="number"
              inputMode="numeric"
              min={1200}
              max={1700}
              value={values.year}
              placeholder="١٤٤٦"
              onChange={(event) => setField("year", event.target.value)}
            />
          </Field>
          <Field label="التخصص" error={errors.specialization}>
            <input
              className="ui-input"
              value={values.specialization}
              maxLength={255}
              onChange={(event) =>
                setField("specialization", event.target.value)
              }
            />
          </Field>
          <Field label="نوع المشاركة" error={errors.participation_type}>
            <input
              className="ui-input"
              list="participation-types"
              value={values.participation_type}
              maxLength={100}
              onChange={(event) =>
                setField("participation_type", event.target.value)
              }
            />
            <datalist id="participation-types">
              <option value="مشرف" />
              <option value="مناقش" />
              <option value="عضو لجنة" />
            </datalist>
          </Field>
          <Field label="الدرجة العلمية" error={errors.degree}>
            <input
              className="ui-input"
              list="academic-degrees"
              value={values.degree}
              maxLength={100}
              onChange={(event) => setField("degree", event.target.value)}
            />
            <datalist id="academic-degrees">
              <option value="ماجستير" />
              <option value="دكتوراه" />
            </datalist>
          </Field>
        </div>
      </Card>

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠٣"
          title="المحتوى العلمي"
          description="الملخص ووصف المشاركة والكلمات التي تساعد في الوصول للرسالة."
        />
        <div className={styles.formGrid}>
          <Field label="ملخص الرسالة *" error={errors.abstract} wide>
            <textarea
              className="ui-textarea"
              rows={8}
              value={values.abstract}
              onChange={(event) => setField("abstract", event.target.value)}
            />
          </Field>
          <Field
            label="وصف المشاركة"
            error={errors.participation_description}
            wide
          >
            <textarea
              className="ui-textarea"
              rows={5}
              value={values.participation_description}
              onChange={(event) =>
                setField("participation_description", event.target.value)
              }
            />
          </Field>
          <Field
            label="الكلمات المفتاحية"
            error={errors.keywords}
            hint="افصل الكلمات بفاصلة."
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

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠٤"
          title="ملف الرسالة والقارئ"
          description="ارفع الملف أو استخدم رابطًا خارجيًا أو رابط تضمين مثل Google Drive."
        />
        <div className={styles.choiceGrid}>
          {(
            [
              ["none", "بدون ملف حاليًا", "احفظ السجل واستكمل المصدر لاحقًا."],
              ["file", "ملف مرفوع", "PDF مرفوع إلى خادم الموقع."],
              ["link", "رابط خارجي", "رابط مباشر أو Google Drive."],
              ["embed", "رابط تضمين", "رابط مناسب للعرض داخل القارئ."],
            ] as const
          ).map(([source, label, description]) => (
            <label
              key={source}
              className={`${styles.choiceCard} ${values.source_type === source ? styles.choiceCardActive : ""}`}
            >
              <input
                type="radio"
                name="dissertation-source"
                checked={values.source_type === source}
                onChange={() => setField("source_type", source)}
              />
              <strong>{label}</strong>
              <small>{description}</small>
            </label>
          ))}
        </div>

        {values.source_type === "file" && (
          <div className={styles.uploadBox}>
            <input
              type="file"
              accept=".pdf"
              onChange={(event) => setFiles({ file: event.target.files?.[0] })}
            />
            <strong>
              {editing && initial?.has_file
                ? "استبدال ملف الرسالة"
                : "اختر ملف الرسالة"}
            </strong>
            <small>PDF بحد أقصى ٥٠MB.</small>
            {files.file && (
              <div className={styles.filePreview}>
                <div>
                  <strong>{files.file.name}</strong>
                  <small>{formatArabicFileSize(files.file.size)}</small>
                </div>
                <button
                  type="button"
                  aria-label="إزالة الملف"
                  onClick={() => setFiles({})}
                >
                  ×
                </button>
              </div>
            )}
            {errors.file_path?.[0] && (
              <em role="alert">{errors.file_path[0]}</em>
            )}
          </div>
        )}

        {(values.source_type === "link" || values.source_type === "embed") && (
          <div className={styles.formGrid}>
            <Field
              label="رابط المصدر *"
              error={errors.source_link}
              hint="يجب أن يبدأ الرابط بـ HTTPS."
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
          number="٠٥"
          title="النشر"
          description="السجل يبدأ كمسودة ولن يظهر للعامة قبل تفعيل النشر."
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
              <small>فعّل الخيار بعد اكتمال البيانات ومراجعة الملف.</small>
            </span>
          </label>
          {values.is_published && (
            <Field
              label="تاريخ النشر"
              error={errors.published_at}
              hint="اتركه فارغًا ليضع الخادم الوقت الحالي."
            >
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
        </div>
      </Card>

      <div className={styles.stickyActions}>
        <Link
          href={
            initial
              ? `/dashboard/dissertations/${initial.id}`
              : "/dashboard/dissertations"
          }
          className="ui-button ui-button--secondary ui-focus"
        >
          إلغاء
        </Link>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitting
            ? "جارٍ الحفظ..."
            : editing
              ? "حفظ التعديلات"
              : "إضافة الرسالة"}
        </Button>
      </div>
    </form>
  );
}
