"use client";

/* eslint-disable @next/next/no-img-element -- API media URLs are external and resolved server-side. */

import { useState } from "react";

import styles from "./visuals.module.css";
import { isThumbnailAvailable } from "./visual-thumbnail.helpers";

export function VisualThumbnail({
  src,
  alt,
  variant,
  fallbackLabel,
}: {
  src: string | null | undefined;
  alt: string;
  variant: "list" | "detail";
  fallbackLabel: string;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  const validSrc = typeof src === "string" && src !== "" ? src : undefined;
  const isUnavailable = !isThumbnailAvailable(validSrc, failedSource);
  const fallbackClassName =
    variant === "list"
      ? styles.thumbnailFallback
      : styles.detailThumbnailFallback;

  if (isUnavailable || validSrc === undefined)
    return (
      <span className={fallbackClassName} role="img" aria-label={alt}>
        {fallbackLabel}
      </span>
    );

  return (
    <img
      className={
        variant === "list" ? styles.listThumbnail : styles.detailThumbnail
      }
      src={validSrc}
      alt={alt}
      width={variant === "list" ? 44 : 640}
      height={variant === "list" ? 44 : 360}
      loading={variant === "list" ? "lazy" : "eager"}
      decoding="async"
      onError={() => setFailedSource(validSrc)}
    />
  );
}
