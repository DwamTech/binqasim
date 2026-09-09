"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Alert,
  Button,
  ErrorState,
  FormField,
  Input,
  Select,
  Skeleton,
} from "@/shared/components/ui";

import {
  createTourGuide,
  getTourGuide,
  TourGuidesClientError,
  updateTourGuide,
} from "../application/tour-guides.client";
import {
  emptyTourGuideForm,
  tourGuideToFormValues,
  type TourGuideFormValues,
} from "../domain/tour-guides.contracts";
import styles from "./tour-guides.module.css";

const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
const maximumPhotoSize = 5 * 1024 * 1024;

export function TourGuideForm({
  mode,
  guideId,
}: {
  mode: "create" | "edit";
  guideId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<TourGuideFormValues>(emptyTourGuideForm);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File>();
  const [loading, setLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !guideId) return;
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const guide = await getTourGuide(guideId ?? "", controller.signal);
        if (!active) return;
        setValues(tourGuideToFormValues(guide));
        setCurrentPhoto(guide.photo_url);
        setLoadError("");
      } catch (reason) {
        if (!active) return;
        setLoadError(
          reason instanceof Error
            ? reason.message
            : "تعذر تحميل بيانات المرشد.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [guideId, mode, reloadKey]);

  const preview = useMemo(
    () => (photo ? URL.createObjectURL(photo) : undefined),
    [photo],
  );

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  function update<K extends keyof TourGuideFormValues>(
    key: K,
    value: TourGuideFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateList(
    key: "languages" | "tour_routes",
    index: number,
    value: string,
  ) {
    update(
      key,
      values[key].map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    );
  }

  function removeListItem(key: "languages" | "tour_routes", index: number) {
    const next = values[key].filter((_, itemIndex) => itemIndex !== index);
    update(key, next.length ? next : [""]);
  }

  async function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    setPhoto(undefined);
    setFieldErrors((current) => ({ ...current, photo: [] }));
    if (!file) {
      setPhoto(undefined);
      return;
    }
    if (!allowedPhotoTypes.includes(file.type)) {
      setFieldErrors((current) => ({
        ...current,
        photo: ["اختر صورة بصيغة JPG أو PNG أو WebP."],
      }));
      input.value = "";
      return;
    }
    if (file.size > maximumPhotoSize) {
      setFieldErrors((current) => ({
        ...current,
        photo: ["يجب ألا يتجاوز حجم الصورة ٥ ميجابايت."],
      }));
      input.value = "";
      return;
    }
    try {
      const dimensions = await imageDimensions(file);
      if (
        dimensions.width < 400 ||
        dimensions.height < 600 ||
        dimensions.width * 3 !== dimensions.height * 2
      ) {
        setFieldErrors((current) => ({
          ...current,
          photo: [
            "الصورة يجب أن تكون بنسبة ٤×٦ وأبعاد لا تقل عن ٤٠٠×٦٠٠ بكسل.",
          ],
        }));
        input.value = "";
        return;
      }
    } catch {
      setFieldErrors((current) => ({
        ...current,
        photo: ["تعذر قراءة أبعاد الصورة. اختر ملف صورة صالحًا."],
      }));
      input.value = "";
      return;
    }
    setPhoto(file);
  }

  function validate(): Record<string, string[]> {
    const next: Record<string, string[]> = {};
    if (values.name.trim().length < 2) next.name = ["اسم المرشد مطلوب."];
    if (values.title.trim().length < 2) next.title = ["المسمى المهني مطلوب."];
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug.trim()))
      next.slug = ["استخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطات فقط."];
    if (!values.languages.some((item) => item.trim()))
      next.languages = ["أضف لغة واحدة على الأقل."];
    if (!values.tour_routes.some((item) => item.trim()))
      next.tour_routes = ["أضف مسارًا سياحيًا واحدًا على الأقل."];
    if (mode === "create" && !photo)
      next.photo = ["الصورة الشخصية ٤×٦ مطلوبة عند إضافة المرشد."];
    return next;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setError("راجع الحقول الموضحة قبل حفظ بيانات المرشد.");
      return;
    }
    setSubmitting(true);
    setError("");
    setFieldErrors({});
    const cleaned: TourGuideFormValues = {
      ...values,
      name: values.name.trim(),
      slug: values.slug.trim(),
      title: values.title.trim(),
      bio: values.bio.trim(),
      languages: values.languages.map((item) => item.trim()).filter(Boolean),
      tour_routes: values.tour_routes
        .map((item) => item.trim())
        .filter(Boolean),
      license_number: values.license_number.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
    };
    try {
      const guide =
        mode === "create"
          ? await createTourGuide(cleaned, photo as File)
          : await updateTourGuide(guideId ?? "", cleaned, photo);
      router.push(`/dashboard/tour-guides/guides/${guide.id}?saved=1`);
      router.refresh();
    } catch (reason) {
      if (reason instanceof TourGuidesClientError)
        setFieldErrors(reason.fieldErrors ?? {});
      setError(reason instanceof Error ? reason.message : "تعذر حفظ المرشد.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <Skeleton
        className={styles.formSkeleton ?? ""}
        aria-label="تحميل النموذج"
      />
    );
  if (loadError)
    return (
      <ErrorState
        title="تعذر تحميل بيانات المرشد"
        description={loadError}
        onRetry={() => setReloadKey((value) => value + 1)}
      />
    );

  return (
    <form className={styles.formLayout} onSubmit={submit} noValidate>
      {error && (
        <Alert variant="error" title="تعذر حفظ البيانات">
          {error}
        </Alert>
      )}

      <section className={`${styles.formCard} ${styles.photoCard}`}>
        <header>
          <span aria-hidden="true">01</span>
          <div>
            <h2>الصورة الشخصية</h2>
            <p>صورة رسمية واضحة بنسبة ٤×٦ لاستخدامها في بطاقة المرشد.</p>
          </div>
        </header>
        <div className={styles.photoEditor}>
          <div className={styles.photoPreview}>
            {preview || currentPhoto ? (
              <img
                src={preview ?? currentPhoto ?? ""}
                alt="معاينة صورة المرشد"
              />
            ) : (
              <span aria-hidden="true">٤×٦</span>
            )}
          </div>
          <div className={styles.uploadControl}>
            <label htmlFor="tour-guide-photo">اختيار صورة شخصية</label>
            <input
              id="tour-guide-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={selectPhoto}
              aria-invalid={Boolean(fieldErrors.photo?.[0])}
              aria-describedby="tour-guide-photo-help"
            />
            <small id="tour-guide-photo-help">
              JPG أو PNG أو WebP، بحد أقصى ٥ ميجابايت. النسبة الأنسب ٢:٣.
            </small>
            {fieldErrors.photo?.[0] && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.photo[0]}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className={styles.formCard}>
        <header>
          <span aria-hidden="true">02</span>
          <div>
            <h2>الهوية المهنية</h2>
            <p>البيانات التي يراها الزائر عند اختيار المرشد المناسب.</p>
          </div>
        </header>
        <div className={styles.formGrid}>
          <FormField
            label="اسم المرشد"
            error={Boolean(fieldErrors.name?.[0])}
            message={fieldErrors.name?.[0]}
          >
            <Input
              value={values.name}
              maxLength={180}
              onChange={(event) => update("name", event.target.value)}
            />
          </FormField>
          <FormField
            label="المسمى المهني"
            error={Boolean(fieldErrors.title?.[0])}
            message={fieldErrors.title?.[0]}
          >
            <Input
              value={values.title}
              maxLength={255}
              placeholder="مثال: مرشدة سياحية معتمدة"
              onChange={(event) => update("title", event.target.value)}
            />
          </FormField>
          <FormField
            label="الرابط المختصر"
            description="يُستخدم في رابط الحجز العام مثل sara-alotaibi."
            error={Boolean(fieldErrors.slug?.[0])}
            message={fieldErrors.slug?.[0]}
          >
            <Input
              dir="ltr"
              value={values.slug}
              maxLength={160}
              placeholder="sara-alotaibi"
              onChange={(event) =>
                update(
                  "slug",
                  event.target.value.toLowerCase().replace(/\s+/g, "-"),
                )
              }
            />
          </FormField>
          <FormField
            label="رقم الترخيص"
            message={fieldErrors.license_number?.[0]}
            error={Boolean(fieldErrors.license_number?.[0])}
          >
            <Input
              dir="ltr"
              value={values.license_number}
              maxLength={100}
              onChange={(event) => update("license_number", event.target.value)}
            />
          </FormField>
          <FormField
            label="سنوات الخبرة"
            message={fieldErrors.experience_years?.[0]}
            error={Boolean(fieldErrors.experience_years?.[0])}
          >
            <Input
              type="number"
              min={0}
              max={80}
              value={values.experience_years}
              onChange={(event) =>
                update("experience_years", Number(event.target.value) || 0)
              }
            />
          </FormField>
          <FormField
            label="ترتيب الظهور"
            description="الأرقام الأقل تظهر أولًا."
            message={fieldErrors.display_order?.[0]}
            error={Boolean(fieldErrors.display_order?.[0])}
          >
            <Input
              type="number"
              min={0}
              value={values.display_order}
              onChange={(event) =>
                update("display_order", Number(event.target.value) || 0)
              }
            />
          </FormField>
          <div className={styles.wideField}>
            <FormField
              label="نبذة عن المرشد"
              message={fieldErrors.bio?.[0]}
              error={Boolean(fieldErrors.bio?.[0])}
            >
              <textarea
                className="ui-textarea ui-focus"
                rows={6}
                maxLength={5000}
                value={values.bio}
                onChange={(event) => update("bio", event.target.value)}
              />
            </FormField>
          </div>
        </div>
      </section>

      <section className={styles.formCard}>
        <header>
          <span aria-hidden="true">03</span>
          <div>
            <h2>التواصل والظهور</h2>
            <p>بيانات تشغيلية تساعد الإدارة في التنسيق مع المرشد.</p>
          </div>
        </header>
        <div className={styles.formGrid}>
          <FormField
            label="رقم الجوال"
            message={fieldErrors.phone?.[0]}
            error={Boolean(fieldErrors.phone?.[0])}
          >
            <Input
              dir="ltr"
              type="tel"
              value={values.phone}
              maxLength={32}
              onChange={(event) => update("phone", event.target.value)}
            />
          </FormField>
          <FormField
            label="البريد الإلكتروني"
            message={fieldErrors.email?.[0]}
            error={Boolean(fieldErrors.email?.[0])}
          >
            <Input
              dir="ltr"
              type="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </FormField>
          <FormField label="حالة الظهور">
            <Select
              value={values.is_active ? "active" : "inactive"}
              options={[
                { value: "active", label: "نشط ويظهر للزوار" },
                { value: "inactive", label: "غير نشط ومخفي" },
              ]}
              onValueChange={(value) => update("is_active", value === "active")}
            />
          </FormField>
        </div>
      </section>

      <Repeater
        title="اللغات"
        description="أضف اللغات التي يستطيع المرشد تقديم الجولة بها."
        values={values.languages}
        placeholder="مثال: العربية"
        error={fieldErrors.languages?.[0]}
        onChange={(index, value) => updateList("languages", index, value)}
        onRemove={(index) => removeListItem("languages", index)}
        onAdd={() => update("languages", [...values.languages, ""])}
      />
      <Repeater
        title="المسارات السياحية"
        description="المسارات التي يمكن للزائر طلبها مع هذا المرشد."
        values={values.tour_routes}
        placeholder="مثال: جولة جدة التاريخية"
        error={fieldErrors.tour_routes?.[0]}
        onChange={(index, value) => updateList("tour_routes", index, value)}
        onRemove={(index) => removeListItem("tour_routes", index)}
        onAdd={() => update("tour_routes", [...values.tour_routes, ""])}
      />

      <footer className={styles.formActions}>
        <Button type="submit" loading={submitting}>
          {mode === "create" ? "إضافة المرشد" : "حفظ التعديلات"}
        </Button>
        <Link
          href="/dashboard/tour-guides/guides"
          className="ui-button ui-button--secondary ui-focus"
        >
          إلغاء
        </Link>
      </footer>
    </form>
  );
}

function Repeater({
  title,
  description,
  values,
  placeholder,
  error,
  onChange,
  onRemove,
  onAdd,
}: {
  title: string;
  description: string;
  values: string[];
  placeholder: string;
  error: string | undefined;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <section className={styles.formCard}>
      <header>
        <span aria-hidden="true">+</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className={styles.repeater}>
        {values.map((value, index) => (
          <div key={`${title}-${index}`}>
            <Input
              value={value}
              maxLength={255}
              placeholder={placeholder}
              aria-label={`${title} ${index + 1}`}
              onChange={(event) => onChange(index, event.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => onRemove(index)}
              aria-label={`حذف من ${title}`}
            >
              حذف
            </Button>
          </div>
        ))}
        {error && <p className={styles.fieldError}>{error}</p>}
        <Button
          variant="secondary"
          className={styles.addRowButton ?? ""}
          onClick={onAdd}
        >
          + إضافة
        </Button>
      </div>
    </section>
  );
}

function imageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const source = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(source);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error("Invalid image"));
    };
    image.src = source;
  });
}
