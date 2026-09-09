"use client";

/* eslint-disable @next/next/no-img-element -- local object URL preview must not invoke the image optimizer. */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type {
  VisualDetail,
  VisualMutationResult,
  VisualSection,
  VisualType,
} from "../../domain/visuals.contracts";
import {
  parseVisualFormData,
  validateVisualInput,
} from "../../domain/visuals.validation";
import {
  clearTypeSpecificErrors,
  formatVisualFileSize,
  visualFileSelectionLabel,
} from "./visual-form.helpers";
import {
  Button,
  Card,
  FormField,
  InlineError,
  Select,
} from "@/shared/components/ui";

import styles from "./visuals.module.css";

type VisualAction = (formData: FormData) => Promise<VisualMutationResult>;

export function VisualForm({
  action,
  sections,
  initial,
}: {
  action: VisualAction;
  sections: VisualSection[];
  initial?: VisualDetail;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<VisualType>(initial?.type ?? "upload");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [file, setFile] = useState<File>();
  const [thumbnail, setThumbnail] = useState<File>();
  const [thumbnailPreview, setThumbnailPreview] = useState<string>();
  const [url, setUrl] = useState(initial?.url ?? "");
  const [sectionId, setSectionId] = useState(
    initial?.section?.id === undefined ? "" : String(initial.section.id),
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const thumbnailPreviewRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewRef.current !== undefined)
        URL.revokeObjectURL(thumbnailPreviewRef.current);
    };
  }, []);

  const setThumbnailFile = (nextThumbnail: File | undefined) => {
    if (thumbnailPreviewRef.current !== undefined)
      URL.revokeObjectURL(thumbnailPreviewRef.current);
    thumbnailPreviewRef.current =
      nextThumbnail === undefined
        ? undefined
        : URL.createObjectURL(nextThumbnail);
    setThumbnail(nextThumbnail);
    setThumbnailPreview(thumbnailPreviewRef.current);
  };

  const clearField = (name: string) => {
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const focusFirstInvalidField = (fieldErrors: Record<string, string[]>) => {
    const name = Object.keys(fieldErrors)[0];
    if (name === undefined) return;
    requestAnimationFrame(() => {
      const control = formRef.current?.elements.namedItem(name);
      if (control instanceof HTMLElement) control.focus();
    });
  };

  const switchType = (nextType: VisualType) => {
    setType(nextType);
    setErrors((current) => clearTypeSpecificErrors(current, nextType));
    if (nextType === "link") {
      setFile(undefined);
      if (fileRef.current) fileRef.current.value = "";
    }
    if (nextType === "upload") setUrl("");
  };

  const submit = (formData: FormData) => {
    if (isPending) return;
    const parsed = parseVisualFormData(
      formData,
      initial === undefined ? "create" : "update",
    );
    if (parsed.input === undefined) {
      const fieldErrors = parsed.fieldErrors ?? {};
      setErrors(fieldErrors);
      setGeneralError(
        Object.keys(fieldErrors).length === 0
          ? undefined
          : "يرجى التحقق من الحقول المطلوبة.",
      );
      focusFirstInvalidField(fieldErrors);
      return;
    }
    const validation = validateVisualInput(
      parsed.input,
      initial === undefined ? "create" : "update",
    );
    if (!validation.valid) {
      setErrors(validation.fieldErrors);
      setGeneralError("يرجى التحقق من الحقول المطلوبة.");
      focusFirstInvalidField(validation.fieldErrors);
      return;
    }
    setErrors({});
    setGeneralError(undefined);
    startTransition(async () => {
      const result = await action(formData);
      if (!result.success) {
        setGeneralError(result.message);
        setErrors(result.fieldErrors ?? {});
        return;
      }
      setSuccess(result.message);
      const visualId = result.id ?? initial?.id;
      router.replace(
        visualId === undefined
          ? "/dashboard/visuals"
          : `/dashboard/visuals/${visualId}`,
      );
      router.refresh();
    });
  };

  const fieldError = (field: string) => errors[field]?.[0];
  return (
    <Card>
      <form ref={formRef} action={submit} className={styles.form} noValidate>
        {generalError && <InlineError>{generalError}</InlineError>}
        {success && (
          <p className="ui-success-message" role="status">
            {success}
          </p>
        )}
        <FormField
          label="العنوان"
          error={fieldError("title") !== undefined}
          message={fieldError("title")}
        >
          <input
            name="title"
            className="ui-input ui-focus"
            defaultValue={initial?.title ?? ""}
            maxLength={255}
            required
            onChange={() => clearField("title")}
          />
        </FormField>
        <label className={styles.textField}>
          <span>الوصف</span>
          <textarea
            name="description"
            className={`${styles.textarea} ui-focus`}
            defaultValue={initial?.description ?? ""}
          />
        </label>
        <fieldset className={styles.typeFieldset}>
          <legend>نوع المرئية</legend>
          <label>
            <input
              type="radio"
              name="type"
              value="upload"
              checked={type === "upload"}
              onChange={() => switchType("upload")}
            />{" "}
            فيديو مرفوع
          </label>
          <label>
            <input
              type="radio"
              name="type"
              value="link"
              checked={type === "link"}
              onChange={() => switchType("link")}
            />{" "}
            رابط خارجي
          </label>
        </fieldset>
        {type === "upload" ? (
          <div className={styles.fileField}>
            <label htmlFor="visual-file">
              ملف الفيديو{" "}
              {initial === undefined ? "(مطلوب)" : "(اختياري عند التحديث)"}
            </label>
            <input
              ref={fileRef}
              id="visual-file"
              name="file"
              type="file"
              className="sr-only"
              accept=".mp4,.m4v,.mov,.webm,.avi,.mkv,.ogv,.3gp,video/*"
              aria-invalid={fieldError("file") !== undefined || undefined}
              aria-describedby={
                fieldError("file") === undefined
                  ? undefined
                  : "visual-file-error"
              }
              onChange={(event) => {
                const candidate = event.currentTarget.files?.[0];
                setFile(candidate);
                clearField("file");
              }}
            />
            <div className={styles.filePicker}>
              <Button
                variant="secondary"
                type="button"
                onClick={() => fileRef.current?.click()}
              >
                اختيار ملف فيديو
              </Button>
              <span aria-live="polite">{visualFileSelectionLabel(file)}</span>
            </div>
            {file && (
              <div className={styles.fileSummary}>
                <span>
                  {file.name} · {formatVisualFileSize(file.size)} ·{" "}
                  {file.type || "نوع غير محدد"}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFile(undefined);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  إزالة الملف
                </Button>
              </div>
            )}
            {fieldError("file") && (
              <p id="visual-file-error" className={styles.error} role="alert">
                {fieldError("file")}
              </p>
            )}
          </div>
        ) : (
          <FormField
            label="الرابط الخارجي"
            error={fieldError("url") !== undefined}
            message={fieldError("url")}
          >
            <input
              name="url"
              type="url"
              className="ui-input ui-focus"
              dir="ltr"
              value={url}
              placeholder="https://example.com/video"
              required
              onChange={(event) => {
                setUrl(event.currentTarget.value);
                clearField("url");
              }}
            />
          </FormField>
        )}
        <div className={styles.twoColumns}>
          <FormField
            label="القسم"
            error={fieldError("section_id") !== undefined}
            message={fieldError("section_id")}
          >
            <Select
              name="section_id"
              value={sectionId}
              aria-label="قسم المرئية"
              options={[
                { value: "", label: "بدون قسم" },
                ...sections.map((section) => ({
                  value: String(section.id),
                  label: section.name,
                })),
              ]}
              onValueChange={(value) => {
                setSectionId(value);
                clearField("section_id");
              }}
            />
          </FormField>
          <FormField
            label="التقييم (٠–٥)"
            error={fieldError("rating") !== undefined}
            message={fieldError("rating")}
          >
            <input
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              className="ui-input ui-focus"
              defaultValue={initial?.rating ?? ""}
              onChange={() => clearField("rating")}
            />
          </FormField>
        </div>
        <label className={styles.textField}>
          <span>الكلمات المفتاحية</span>
          <input
            name="keywords"
            className="ui-input ui-focus"
            defaultValue={initial?.keywords ?? ""}
          />
        </label>
        <div className={styles.fileField}>
          <label htmlFor="visual-thumbnail">الصورة المصغرة (اختيارية)</label>
          <input
            ref={thumbnailRef}
            id="visual-thumbnail"
            name="thumbnail"
            type="file"
            className="sr-only"
            accept=".jpg,.jpeg,.png,.webp,.avif,image/*"
            aria-invalid={fieldError("thumbnail") !== undefined || undefined}
            aria-describedby={
              fieldError("thumbnail") === undefined
                ? undefined
                : "visual-thumbnail-error"
            }
            onChange={(event) => {
              setThumbnailFile(event.currentTarget.files?.[0]);
              clearField("thumbnail");
            }}
          />
          <div className={styles.filePicker}>
            <Button
              variant="secondary"
              type="button"
              onClick={() => thumbnailRef.current?.click()}
            >
              اختيار صورة مصغرة
            </Button>
            <span aria-live="polite">
              {visualFileSelectionLabel(thumbnail)}
            </span>
          </div>
          {thumbnailPreview && (
            <img
              className={styles.thumbnailPreview}
              src={thumbnailPreview}
              alt="معاينة الصورة المصغرة المختارة"
            />
          )}
          {thumbnail && (
            <div className={styles.fileSummary}>
              <span>
                {thumbnail.name} · {formatVisualFileSize(thumbnail.size)}
              </span>
              <Button
                variant="secondary"
                onClick={() => {
                  setThumbnailFile(undefined);
                  if (thumbnailRef.current) thumbnailRef.current.value = "";
                }}
              >
                إزالة الصورة
              </Button>
            </div>
          )}
          {fieldError("thumbnail") && (
            <p
              id="visual-thumbnail-error"
              className={styles.error}
              role="alert"
            >
              {fieldError("thumbnail")}
            </p>
          )}
        </div>
        <div className={styles.formActions}>
          <Button type="submit" loading={isPending} disabled={isPending}>
            {initial === undefined ? "إضافة المرئية" : "حفظ التعديلات"}
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={isPending}
            onClick={() => router.back()}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Card>
  );
}
