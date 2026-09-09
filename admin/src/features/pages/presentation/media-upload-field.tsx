"use client";

/* eslint-disable @next/next/no-img-element -- authenticated previews use API-projected URLs. */

import {
  type ChangeEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { Spinner } from "@/shared/components/ui";

import type { PageMedia } from "../domain/pages.contracts";
import styles from "./media-upload-field.module.css";
import { PagesIcon } from "./pages-icons";

type MediaKind = PageMedia["type"];
type UploadOutcome = "idle" | "pending" | "success" | "failure";

const mediaCopy: Record<
  MediaKind,
  {
    emptyTitle: string;
    choose: string;
    replace: string;
    uploading: string;
    failure: string;
    preview: string;
  }
> = {
  image: {
    emptyTitle: "أضف صورة لهذا القسم",
    choose: "اختيار صورة",
    replace: "استبدال الصورة",
    uploading: "جارٍ رفع الصورة…",
    failure: "تعذر رفع الصورة. بقيت الصورة السابقة كما هي، حاول مرة أخرى.",
    preview: "معاينة الصورة المختارة",
  },
  video: {
    emptyTitle: "أضف فيديو لهذا القسم",
    choose: "اختيار فيديو",
    replace: "استبدال الفيديو",
    uploading: "جارٍ رفع الفيديو…",
    failure: "تعذر رفع الفيديو. بقي الفيديو السابق كما هو، حاول مرة أخرى.",
    preview: "معاينة الفيديو المختار",
  },
  audio: {
    emptyTitle: "أضف ملفًا صوتيًا لهذا القسم",
    choose: "اختيار ملف صوتي",
    replace: "استبدال الملف الصوتي",
    uploading: "جارٍ رفع الملف الصوتي…",
    failure: "تعذر رفع الملف الصوتي. بقي الملف السابق كما هو، حاول مرة أخرى.",
    preview: "معاينة الملف الصوتي المختار",
  },
  document: {
    emptyTitle: "أضف مستندًا لهذا القسم",
    choose: "اختيار مستند",
    replace: "استبدال المستند",
    uploading: "جارٍ رفع المستند…",
    failure: "تعذر رفع المستند. بقي المستند السابق كما هو، حاول مرة أخرى.",
    preview: "المستند المختار",
  },
};

function formatBytes(value: number): string {
  if (value < 1024) return `${value} بايت`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} كيلوبايت`;
  return `${(value / (1024 * 1024)).toFixed(1)} ميجابايت`;
}

/**
 * Keeps upload completion logic deterministic and independently testable. A
 * replacement succeeds only when the parent projects a new stable media ID.
 */
export function resolveMediaUploadOutcome({
  hasSelection,
  observedUploading,
  uploading,
  previousMediaId,
  currentMediaId,
}: {
  hasSelection: boolean;
  observedUploading: boolean;
  uploading: boolean;
  previousMediaId: PageMedia["id"] | null;
  currentMediaId: PageMedia["id"] | null;
}): UploadOutcome {
  if (!hasSelection) return "idle";
  if (uploading || !observedUploading) return "pending";
  return currentMediaId !== previousMediaId ? "success" : "failure";
}

function MediaPreview({
  kind,
  url,
  label,
}: {
  kind: MediaKind;
  url: string;
  label: string;
}) {
  if (kind === "image") {
    return <img className={styles.visualPreview} src={url} alt={label} />;
  }
  if (kind === "video") {
    return (
      <video
        className={styles.visualPreview}
        controls
        preload="metadata"
        src={url}
        aria-label={label}
      />
    );
  }
  if (kind === "audio") {
    return (
      <audio
        className={styles.audioPreview}
        controls
        preload="metadata"
        src={url}
        aria-label={label}
      />
    );
  }
  return null;
}

export function MediaUploadField({
  label,
  accept,
  guidance,
  media,
  kind,
  uploading,
  disabled,
  error = null,
  optional = false,
  onFile,
}: {
  label: string;
  accept: string;
  guidance: string;
  media?: PageMedia | undefined;
  kind: MediaKind;
  uploading: boolean;
  disabled: boolean;
  error?: string | null | undefined;
  optional?: boolean;
  onFile: (file: File | undefined) => void | Promise<void>;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const previousMediaIdRef = useRef<PageMedia["id"] | null>(null);
  const observedUploadingRef = useRef(false);
  const attemptRef = useRef(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const copy = mediaCopy[kind];
  const helpId = `${id}-help`;
  const statusId = `${id}-status`;

  const releaseSelectedPreview = useCallback((): void => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setSelectedPreviewUrl(null);
  }, []);

  const clearPendingSelection = useCallback((): void => {
    releaseSelectedPreview();
    setSelectedFile(null);
  }, [releaseSelectedPreview]);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!selectedFile) return;
    if (uploading) {
      observedUploadingRef.current = true;
      return;
    }

    const outcome = resolveMediaUploadOutcome({
      hasSelection: true,
      observedUploading: observedUploadingRef.current,
      uploading,
      previousMediaId: previousMediaIdRef.current,
      currentMediaId: media?.id ?? null,
    });
    if (outcome === "pending") return;

    clearPendingSelection();
    observedUploadingRef.current = false;
    setUploadError(outcome === "failure" ? copy.failure : null);
  }, [clearPendingSelection, copy.failure, media?.id, selectedFile, uploading]);

  function markImmediateFailure(attempt: number): void {
    if (attempt !== attemptRef.current) return;
    clearPendingSelection();
    observedUploadingRef.current = false;
    setUploadError(copy.failure);
  }

  function handleChoose(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || uploading) return;
    inputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const attempt = attemptRef.current + 1;
    attemptRef.current = attempt;
    previousMediaIdRef.current = media?.id ?? null;
    observedUploadingRef.current = false;
    releaseSelectedPreview();
    setSelectedFile(file);
    setUploadError(null);

    if (
      kind !== "document" &&
      typeof URL !== "undefined" &&
      typeof URL.createObjectURL === "function"
    ) {
      const previewUrl = URL.createObjectURL(file);
      previewUrlRef.current = previewUrl;
      setSelectedPreviewUrl(previewUrl);
    }

    try {
      const result = onFile(file);
      if (result && typeof result.then === "function") {
        void result.catch(() => markImmediateFailure(attempt));
      }
    } catch {
      markImmediateFailure(attempt);
    }
  }

  const visibleError = error ?? uploadError;
  const showPendingSelection = selectedFile !== null && error === null;
  const projectedUrl = showPendingSelection
    ? (selectedPreviewUrl ?? media?.url)
    : media?.url;
  const projectedKind =
    showPendingSelection && selectedPreviewUrl ? kind : media?.type;
  const summaryName = showPendingSelection ? selectedFile.name : media?.name;
  const summarySize = showPendingSelection ? selectedFile.size : media?.size;
  // media?.mime_type
  const busy = uploading || showPendingSelection;

  return (
    <section
      className={styles.field}
      aria-labelledby={`${id}-label`}
      aria-describedby={`${helpId} ${statusId}`}
      aria-busy={busy || undefined}
    >
      <div className={styles.heading}>
        <div>
          <strong id={`${id}-label`}>{label}</strong>
          {guidance && (
            <p className={styles.guidance} id={helpId}>
              {optional ? "اختياري — " : ""}
              {guidance}
            </p>
          )}
        </div>
        {media && !selectedFile && (
          <span className={styles.readyState}>✓ تم الرفع</span>
        )}
      </div>

      {!media && !selectedFile && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <PagesIcon name={kind === "document" ? "document" : kind} />
          </span>
          <strong>{copy.emptyTitle}</strong>
          <small>{guidance}</small>
        </div>
      )}

      {(projectedUrl || summaryName) && (
        <div className={styles.previewCard}>
          {projectedUrl && projectedKind && (
            <MediaPreview
              kind={projectedKind}
              url={projectedUrl}
              label={copy.preview}
            />
          )}
          <div className={styles.summary}>
            <span className={styles.summaryIcon} aria-hidden="true">
              <PagesIcon
                name={
                  (projectedKind ?? kind) === "document"
                    ? "document"
                    : (projectedKind ?? kind)
                }
              />
            </span>
            <span className={styles.fileIdentity}>
              <strong>{summaryName}</strong>
              <span className={styles.metadata}>
                {typeof summarySize === "number" && (
                  <small>{formatBytes(summarySize)}</small>
                )}
              </span>
            </span>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={`${styles.trigger} ui-button ui-button--secondary ui-focus`}
          type="button"
          disabled={disabled || uploading}
          aria-controls={id}
          onClick={handleChoose}
        >
          {uploading ? (
            <Spinner label={copy.uploading} />
          ) : (
            <PagesIcon name={kind === "document" ? "document" : kind} />
          )}
          {uploading ? copy.uploading : media ? copy.replace : copy.choose}
        </button>
        <input
          ref={inputRef}
          id={id}
          className={styles.fileInput}
          type="file"
          accept={accept}
          disabled={disabled || uploading}
          aria-label={media ? copy.replace : copy.choose}
          aria-describedby={`${helpId} ${statusId}`}
          aria-invalid={visibleError ? true : undefined}
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
          onChange={handleFileChange}
        />
      </div>

      <div id={statusId} className={styles.status} aria-live="polite">
        {uploading && <span>{copy.uploading}</span>}
        {!uploading && selectedFile && (
          <span>تم اختيار {selectedFile.name}، جارٍ بدء الرفع…</span>
        )}
        {visibleError && (
          <span className={styles.error} role="alert">
            {visibleError}
          </span>
        )}
      </div>
    </section>
  );
}
