"use client";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadGalleryMediaAction } from "../../application/gallery-media.actions";
import { validateGalleryMediaFiles } from "../../domain/gallery-media.validation";
import { Button, Card, InlineError } from "@/shared/components/ui";
import { formatArabicNumber } from "@/shared/lib/arabic-format";
import { formatFileSize } from "./gallery-media-preview";
import {
  shouldRedirectAfterGalleryUpload,
  uploadGalleryMediaSequentially,
  type UploadQueueItem,
} from "./gallery-media-upload.helpers";
import styles from "../gallery-media.module.css";
type QueuedFile = UploadQueueItem;
const fingerprint = (file: File) =>
  `${file.name}:${file.size}:${file.lastModified}`;
export function GalleryMediaUploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<QueuedFile[]>([]);
  const [general, setGeneral] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [pending, startTransition] = useTransition();
  const mountedRef = useRef(true);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const fileErrors = useMemo(
    () => validateGalleryMediaFiles(items.map((item) => item.file)),
    [items],
  );
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setItems((current) => {
      const known = new Set(current.map((item) => fingerprint(item.file)));
      return [
        ...current,
        ...Array.from(files)
          .filter((file) => !known.has(fingerprint(file)))
          .map((file) => ({ file, state: "pending" as const })),
      ];
    });
    if (inputRef.current) inputRef.current.value = "";
  };
  const submit = () => {
    if (pending) return;
    const errors = validateGalleryMediaFiles(items.map((item) => item.file));
    if (Object.keys(errors).length > 0) {
      setGeneral("يرجى التحقق من الملفات المختارة.");
      const firstInvalid = items.findIndex(
        (_, index) => errors[`files.${index}`] !== undefined,
      );
      requestAnimationFrame(() => {
        if (firstInvalid >= 0) itemRefs.current[firstInvalid]?.focus();
        else inputRef.current?.focus();
      });
      return;
    }
    setGeneral(undefined);
    setSuccess(undefined);
    startTransition(async () => {
      const outcome = await uploadGalleryMediaSequentially(
        items,
        (file) => {
          const formData = new FormData();
          formData.append("files[]", file);
          return uploadGalleryMediaAction(formData);
        },
        (index, item) => {
          if (!mountedRef.current) return;
          setItems((current) =>
            current.map((entry, position) =>
              position === index ? item : entry,
            ),
          );
        },
      );
      if (!mountedRef.current) return;
      if (shouldRedirectAfterGalleryUpload(outcome)) {
        setSuccess("تم رفع الملفات بنجاح. جارٍ الانتقال إلى معرض الوسائط.");
        router.replace("/dashboard/gallery-media");
      } else
        setGeneral(
          outcome.succeeded > 0
            ? "تم رفع بعض الملفات فقط. راجع الملفات الفاشلة وأعد المحاولة."
            : "تعذّر رفع الملفات. حاول مرة أخرى.",
        );
    });
  };
  return (
    <Card>
      <div className={styles.stack}>
        {general && <InlineError>{general}</InlineError>}
        {success && (
          <p className="ui-success-message" role="status">
            {success}
          </p>
        )}
        <div className={styles.fileField}>
          <label htmlFor="gallery-media-files">ملفات المعرض</label>
          <input
            ref={inputRef}
            id="gallery-media-files"
            className="sr-only"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.webp,.avif,.bmp,.heic,.heif,.mp4,.m4v,.mov,.webm,.avi,.mkv,.ogv,.3gp,image/*,video/*"
            onChange={(event) => addFiles(event.currentTarget.files)}
          />
          <div className={styles.fileActions}>
            <Button
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
            >
              اختيار ملفات
            </Button>
            <span aria-live="polite">
              {items.length === 0
                ? "لم يتم اختيار ملفات"
                : `تم اختيار ${formatArabicNumber(items.length)} ملف`}
            </span>
          </div>
        </div>
        <ul className={styles.uploadList}>
          {items.map((item, index) => (
            <li key={fingerprint(item.file)} className={styles.uploadItem}>
              <div
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                tabIndex={-1}
                aria-invalid={
                  fileErrors[`files.${index}`] !== undefined ||
                  item.error !== undefined ||
                  undefined
                }
                aria-describedby={
                  fileErrors[`files.${index}`] !== undefined ||
                  item.error !== undefined
                    ? `gallery-file-error-${index}`
                    : undefined
                }
              >
                <div className={styles.fileSummary}>
                  <strong>{item.file.name}</strong>
                  <span>
                    {formatFileSize(item.file.size)} ·{" "}
                    {item.file.type || "نوع غير محدد"}
                  </span>
                  {fileErrors[`files.${index}`]?.map((message) => (
                    <p
                      id={`gallery-file-error-${index}`}
                      className={styles.error}
                      role="alert"
                      key={message}
                    >
                      {message}
                    </p>
                  ))}
                  {item.error && (
                    <p
                      id={`gallery-file-error-${index}`}
                      className={styles.error}
                      role="alert"
                    >
                      {item.error}
                    </p>
                  )}
                  <span aria-live="polite">
                    {
                      {
                        pending: "بانتظار الرفع",
                        uploading: `جارٍ رفع ${formatArabicNumber(index + 1)} من ${formatArabicNumber(items.length)}`,
                        success: "تم الرفع",
                        failed: "فشل الرفع",
                      }[item.state]
                    }
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  setItems((current) =>
                    current.filter((_, position) => position !== index),
                  )
                }
              >
                إزالة
              </Button>
            </li>
          ))}
        </ul>
        <div className={styles.formActions}>
          <Button
            onClick={submit}
            loading={pending}
            disabled={pending || items.length === 0}
          >
            رفع الملفات
          </Button>
          <Button
            variant="secondary"
            disabled={pending || items.length === 0}
            onClick={() => setItems([])}
          >
            إزالة الكل
          </Button>
        </div>
      </div>
    </Card>
  );
}
