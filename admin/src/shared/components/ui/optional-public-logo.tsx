"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

const publicLogoCandidates = ["/logo.webp", "/logo.png", "/logo.jpg"] as const;

type OptionalPublicLogoProps = {
  fallback: ReactNode;
  className: string;
  imageClassName?: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
};

export function OptionalPublicLogo({
  fallback,
  className,
  imageClassName,
  alt = "",
  sizes,
  priority = false,
}: OptionalPublicLogoProps) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const source = publicLogoCandidates[candidateIndex];

  if (!source) return fallback;

  return (
    <span className={className}>
      <Image
        src={source}
        alt={alt}
        fill
        sizes={sizes}
        className={imageClassName}
        onError={() => setCandidateIndex((current) => current + 1)}
        priority={priority}
        unoptimized
      />
    </span>
  );
}
