"use client";
/* eslint-disable @next/next/no-img-element -- Preview URLs are runtime backend media and may use unconfigured hosts. */
import { useRef, useState } from "react";
import type { GalleryMediaItem } from "../../domain/gallery-media.contracts";
import { Badge, Dialog } from "@/shared/components/ui";
import { formatArabicFileSize } from "@/shared/lib/arabic-format";
import styles from "../gallery-media.module.css";

export function formatMediaFileName(name: string) {
  const separator = name.lastIndexOf(".");
  if (separator <= 0 || separator === name.length - 1) {
    return { baseName: name, extension: "" };
  }
  return {
    baseName: name.slice(0, separator),
    extension: name.slice(separator + 1).toUpperCase(),
  };
}

export function GalleryMediaPreview({
  item,
  open,
  onOpenChange,
}: {
  item: GalleryMediaItem;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const [broken, setBroken] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const available =
    item.url !== null && item.url !== undefined && item.url !== "" && !broken;
  const fileName = formatMediaFileName(item.original_name);
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={item.type === "image" ? "معاينة الصورة" : "معاينة الفيديو"}
      size="wide"
    >
      <div className={styles.dialogInfo}>
        <div className={styles.dialogMediaFrame}>
          {item.type === "image" ? (
            available && !broken ? (
              <img
                className={`${styles.dialogMedia} ${styles.dialogImage}`}
                src={item.url ?? undefined}
                alt={`معاينة ${item.original_name}`}
                onError={() => setBroken(true)}
              />
            ) : (
              <div className={styles.placeholder}>تعذّر تحميل الصورة.</div>
            )
          ) : available ? (
            <>
              <video
                ref={videoRef}
                className={`${styles.dialogMedia} ${styles.dialogVideo}`}
                controls
                playsInline
                preload="metadata"
                src={item.url ?? undefined}
                aria-label={`تشغيل ${item.original_name}`}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onError={() => setBroken(true)}
              >
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
              {!playing && (
                <button
                  type="button"
                  className={styles.dialogPlayButton}
                  aria-label={`تشغيل الفيديو ${item.original_name}`}
                  onClick={() => {
                    videoRef.current?.play().catch(() => setPlaying(false));
                  }}
                >
                  <span aria-hidden="true">▶</span>
                </button>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>تعذّر تحميل ملف الفيديو.</div>
          )}
        </div>
        <div className={styles.dialogMeta}>
          <div className={styles.dialogName}>
            <span className={styles.dialogFileIcon} aria-hidden="true">
              {item.type === "image" ? "▧" : "▶"}
            </span>
            <div>
              <strong title={item.original_name}>{fileName.baseName}</strong>
              <span className={styles.dialogDetail} dir="ltr">
                {fileName.extension
                  ? `${fileName.extension} · ${item.mime_type}`
                  : item.mime_type}
              </span>
            </div>
          </div>
          <div>
            <Badge variant={item.type === "image" ? "success" : "warning"}>
              {item.type === "image" ? "صورة" : "فيديو"}
            </Badge>
            <span className={styles.dialogDetail}>
              {formatFileSize(item.size)}
            </span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
export function formatFileSize(size: number) {
  return formatArabicFileSize(size, 1);
}
