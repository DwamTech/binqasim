"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert, Button, Card } from "@/shared/components/ui";
import {
  createScientificFatwa,
  updateScientificFatwa,
} from "../application/scientific-fatwas.client";
import { validateScientificFatwaForm } from "../application/scientific-fatwas.form";
import {
  emptyScientificFatwaForm,
  scientificFatwaToFormValues,
  type ScientificFatwaCategory,
  type ScientificFatwaFormValues,
  type ScientificFatwaItem,
} from "../domain/scientific-fatwas.contracts";
import styles from "./scientific-fatwas.module.css";

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
  children: React.ReactNode;
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
    <header className={styles.sectionTitle}>
      <span>{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}

export function ScientificFatwaForm({
  categories,
  initial,
}: {
  categories: ScientificFatwaCategory[];
  initial?: ScientificFatwaItem;
}) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [values, setValues] = useState<ScientificFatwaFormValues>(() => {
    if (!initial) return { ...emptyScientificFatwaForm };
    const next = scientificFatwaToFormValues(initial);
    if (!next.category_id) {
      const matched = categories.find((item) => item.name === next.category);
      if (matched) next.category_id = matched.id;
    }
    return next;
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const selectableCategories = categories.filter(
    (item) => item.is_active || item.id === values.category_id,
  );

  function setField<K extends keyof ScientificFatwaFormValues>(
    field: K,
    value: ScientificFatwaFormValues[K],
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
    const nextErrors = validateScientificFatwaForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setGlobalError("راجع الحقول المطلوبة قبل الحفظ.");
      return;
    }
    setSubmitting(true);
    setGlobalError(null);
    try {
      const result = initial
        ? await updateScientificFatwa(initial.id, values)
        : await createScientificFatwa(values);
      router.replace(
        `/dashboard/scientific-fatwas/${result.data.id}?notice=${editing ? "updated" : "created"}`,
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
        reason instanceof Error ? reason.message : "تعذر حفظ المسألة.",
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
        <Alert variant="error" title="تعذر حفظ المسألة">
          {globalError}
        </Alert>
      )}

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠١"
          title="هوية المسألة"
          description="البيانات المستخدمة في الكرت والرابط العام والتصنيف العلمي."
        />
        <div className={styles.formGrid}>
          <Field label="عنوان المسألة *" error={errors.title} wide>
            <input
              className="ui-input"
              maxLength={255}
              value={values.title}
              onChange={(event) => setField("title", event.target.value)}
            />
          </Field>
          <Field label="التصنيف العلمي *" error={errors.category_id}>
            <select
              className="ui-input"
              value={values.category_id}
              onChange={(event) => {
                const selected = categories.find(
                  (item) => item.id === event.target.value,
                );
                setField("category_id", event.target.value);
                setField("category", selected?.name ?? "");
              }}
            >
              <option value="">اختر التصنيف العلمي</option>
              {selectableCategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.is_active ? "" : " — غير نشط"}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="تاريخ العرض *"
            error={errors.date_label}
            hint="يظهر كما تكتبه، مثال: ١٢ رجب ١٤٤٦هـ"
          >
            <input
              className="ui-input"
              maxLength={120}
              value={values.date_label}
              onChange={(event) => setField("date_label", event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠٢"
          title="السؤال والجواب"
          description="النص الكامل الذي يظهر في صفحة المسألة والنسخ المختصرة في البطاقات."
        />
        <div className={styles.formGrid}>
          <Field label="نص السؤال *" error={errors.question} wide>
            <textarea
              className="ui-textarea"
              rows={6}
              value={values.question}
              onChange={(event) => setField("question", event.target.value)}
            />
          </Field>
          <Field label="الجواب العلمي *" error={errors.answer} wide>
            <textarea
              className="ui-textarea"
              rows={12}
              value={values.answer}
              onChange={(event) => setField("answer", event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠٣"
          title="الفهرسة والمراجع"
          description="ضع كل مرجع في سطر، وافصل الكلمات المفتاحية بفاصلة أو سطر جديد."
        />
        <div className={styles.formGrid}>
          <Field label="المصادر والمراجع" error={errors.sources} wide>
            <textarea
              className="ui-textarea"
              rows={6}
              value={values.sources}
              onChange={(event) => setField("sources", event.target.value)}
            />
          </Field>
          <Field label="الكلمات المفتاحية" error={errors.keywords} wide>
            <textarea
              className="ui-textarea"
              rows={3}
              value={values.keywords}
              onChange={(event) => setField("keywords", event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className={styles.formCard ?? ""}>
        <SectionTitle
          number="٠٤"
          title="الظهور والنشر"
          description="حدد إمكانية فتح المسألة للعامة، ثم اختر هل تظهر في قائمة الفتاوى أم عبر رابطها المباشر فقط."
        />
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
              <strong>منشورة للعامة</strong>
              <small>اتركها غير مفعلة للاحتفاظ بالمسألة كمسودة.</small>
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
              <strong>المسألة المختارة في الرئيسية</strong>
              <small>تفعيلها يستبدل المسألة المختارة الحالية تلقائيًا.</small>
            </span>
          </label>
          <label className={styles.toggleCard}>
            <input
              type="checkbox"
              checked={values.is_listed}
              disabled={!values.is_published}
              onChange={(event) => setField("is_listed", event.target.checked)}
            />
            <span>
              <strong>تظهر داخل قائمة الفتاوى</strong>
              <small>
                عند إيقافها تبقى المسألة متاحة عبر رابطها المباشر بعد النشر.
              </small>
            </span>
          </label>
          {values.is_published && (
            <Field
              label="موعد النشر"
              error={errors.published_at}
              hint="اتركه فارغًا للنشر فور الحفظ."
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
              ? `/dashboard/scientific-fatwas/${initial.id}`
              : "/dashboard/scientific-fatwas"
          }
          className="ui-button ui-button--secondary ui-focus"
        >
          إلغاء
        </Link>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {editing ? "حفظ التعديلات" : "إضافة المسألة"}
        </Button>
      </div>
    </form>
  );
}
