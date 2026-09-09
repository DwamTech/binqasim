import React from "react";
import type { PageComponentType } from "./page-component-catalog";

export function SectionStructuralPreview({ type }: { type: PageComponentType }) {
  switch (type) {
    case "hero":
      return (
        <svg viewBox="0 0 120 72" className="previewSvg" aria-hidden="true">
          <rect width="120" height="72" rx="6" fill="var(--color-surface-muted)" />
          <rect x="12" y="14" width="60" height="8" rx="2" fill="var(--color-primary)" />
          <rect x="12" y="26" width="80" height="5" rx="1.5" fill="var(--color-text-muted)" opacity="0.6" />
          <rect x="12" y="34" width="55" height="5" rx="1.5" fill="var(--color-text-muted)" opacity="0.4" />
          <rect x="12" y="46" width="28" height="12" rx="4" fill="var(--color-primary)" />
          <rect x="44" y="46" width="28" height="12" rx="4" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" />
        </svg>
      );

    case "rich_content":
      return (
        <svg viewBox="0 0 120 72" className="previewSvg" aria-hidden="true">
          <rect width="120" height="72" rx="6" fill="var(--color-surface-muted)" />
          <rect x="12" y="14" width="45" height="7" rx="2" fill="var(--color-primary)" />
          <rect x="12" y="27" width="96" height="4.5" rx="1.5" fill="var(--color-text-muted)" opacity="0.7" />
          <rect x="12" y="35" width="90" height="4.5" rx="1.5" fill="var(--color-text-muted)" opacity="0.7" />
          <rect x="12" y="43" width="70" height="4.5" rx="1.5" fill="var(--color-text-muted)" opacity="0.7" />
          <circle cx="16" cy="55" r="2" fill="var(--color-primary)" />
          <rect x="22" y="53" width="65" height="4" rx="1" fill="var(--color-text-muted)" opacity="0.6" />
        </svg>
      );

    case "image_text":
      return (
        <svg viewBox="0 0 120 72" className="previewSvg" aria-hidden="true">
          <rect width="120" height="72" rx="6" fill="var(--color-surface-muted)" />
          {/* Image side */}
          <rect x="8" y="10" width="48" height="52" rx="4" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="32" cy="30" r="7" fill="var(--color-primary)" opacity="0.3" />
          <path d="M16 52l12-14 8 8 8-10 12 16H16z" fill="var(--color-primary)" opacity="0.4" />
          {/* Text side */}
          <rect x="62" y="16" width="46" height="7" rx="2" fill="var(--color-primary)" />
          <rect x="62" y="28" width="50" height="4" rx="1" fill="var(--color-text-muted)" opacity="0.7" />
          <rect x="62" y="35" width="45" height="4" rx="1" fill="var(--color-text-muted)" opacity="0.7" />
          <rect x="62" y="42" width="38" height="4" rx="1" fill="var(--color-text-muted)" opacity="0.7" />
        </svg>
      );

    case "cards":
      return (
        <svg viewBox="0 0 120 72" className="previewSvg" aria-hidden="true">
          <rect width="120" height="72" rx="6" fill="var(--color-surface-muted)" />
          <rect x="8" y="12" width="32" height="48" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <rect x="12" y="16" width="24" height="20" rx="2" fill="var(--color-primary-soft)" />
          <rect x="12" y="40" width="24" height="4" rx="1" fill="var(--color-primary)" />
          <rect x="12" y="47" width="18" height="3" rx="1" fill="var(--color-text-muted)" opacity="0.5" />

          <rect x="44" y="12" width="32" height="48" rx="4" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="48" y="16" width="24" height="20" rx="2" fill="var(--color-primary-soft)" />
          <rect x="48" y="40" width="24" height="4" rx="1" fill="var(--color-primary)" />
          <rect x="48" y="47" width="18" height="3" rx="1" fill="var(--color-text-muted)" opacity="0.5" />

          <rect x="80" y="12" width="32" height="48" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <rect x="84" y="16" width="24" height="20" rx="2" fill="var(--color-primary-soft)" />
          <rect x="84" y="40" width="24" height="4" rx="1" fill="var(--color-primary)" />
          <rect x="84" y="47" width="18" height="3" rx="1" fill="var(--color-text-muted)" opacity="0.5" />
        </svg>
      );

    case "faq":
      return (
        <svg viewBox="0 0 120 72" className="previewSvg" aria-hidden="true">
          <rect width="120" height="72" rx="6" fill="var(--color-surface-muted)" />
          <rect x="10" y="10" width="100" height="15" rx="3" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <rect x="16" y="15" width="55" height="5" rx="1" fill="var(--color-primary)" />
          <path d="M100 15v5M97.5 17.5h5" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />

          <rect x="10" y="28" width="100" height="32" rx="3" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="16" y="34" width="60" height="5" rx="1" fill="var(--color-primary)" />
          <path d="M97.5 36.5h5" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="16" y="44" width="88" height="3.5" rx="1" fill="var(--color-text-muted)" opacity="0.6" />
          <rect x="16" y="50" width="75" height="3.5" rx="1" fill="var(--color-text-muted)" opacity="0.6" />
        </svg>
      );

    case "cta":
      return (
        <svg viewBox="0 0 120 72" className="previewSvg" aria-hidden="true">
          <rect width="120" height="72" rx="6" fill="var(--color-surface-muted)" />
          <rect x="8" y="12" width="104" height="48" rx="6" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="30" y="22" width="60" height="7" rx="2" fill="var(--color-primary)" />
          <rect x="25" y="33" width="70" height="4" rx="1" fill="var(--color-text-muted)" opacity="0.7" />
          <rect x="45" y="43" width="30" height="11" rx="4" fill="var(--color-primary)" />
        </svg>
      );

    case "image":
      return (
        <svg viewBox="0 0 120 72" className="previewSvg" aria-hidden="true">
          <rect width="120" height="72" rx="6" fill="var(--color-surface-muted)" />
          <rect x="10" y="8" width="100" height="46" rx="4" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="45" cy="24" r="6" fill="var(--color-primary)" opacity="0.4" />
          <path d="M22 46l20-20 16 16 12-12 24 16H22z" fill="var(--color-primary)" opacity="0.5" />
          <rect x="35" y="58" width="50" height="4" rx="1" fill="var(--color-text-muted)" opacity="0.6" />
        </svg>
      );

    case "video":
      return (
        <svg viewBox="0 0 120 72" className="previewSvg" aria-hidden="true">
          <rect width="120" height="72" rx="6" fill="var(--color-surface-muted)" />
          <rect x="10" y="8" width="100" height="56" rx="4" fill="#0f172a" />
          <circle cx="60" cy="36" r="14" fill="var(--color-primary)" opacity="0.9" />
          <polygon points="56,30 68,36 56,42" fill="#ffffff" />
          <rect x="16" y="56" width="88" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
          <rect x="16" y="56" width="35" height="3" rx="1.5" fill="var(--color-primary)" />
        </svg>
      );

    case "audio":
      return (
        <svg viewBox="0 0 120 72" className="previewSvg" aria-hidden="true">
          <rect width="120" height="72" rx="6" fill="var(--color-surface-muted)" />
          <rect x="10" y="16" width="100" height="40" rx="6" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="26" cy="36" r="10" fill="var(--color-primary)" />
          <polygon points="24,31 31,36 24,41" fill="#ffffff" />
          <path d="M46 36h4M54 28v16M60 22v28M66 32v8M72 26v20M78 30v12M84 34v4M90 36h4" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "gallery":
      return (
        <svg viewBox="0 0 120 72" className="previewSvg" aria-hidden="true">
          <rect width="120" height="72" rx="6" fill="var(--color-surface-muted)" />
          <rect x="8" y="10" width="48" height="24" rx="3" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <path d="M12 28l10-10 8 8 6-6 16 8H12z" fill="var(--color-primary)" opacity="0.4" />

          <rect x="64" y="10" width="48" height="24" rx="3" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <path d="M68 28l10-10 8 8 6-6 16 8H68z" fill="var(--color-primary)" opacity="0.4" />

          <rect x="8" y="38" width="48" height="24" rx="3" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <path d="M12 56l10-10 8 8 6-6 16 8H12z" fill="var(--color-primary)" opacity="0.4" />

          <rect x="64" y="38" width="48" height="24" rx="3" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <path d="M68 56l10-10 8 8 6-6 16 8H68z" fill="var(--color-primary)" opacity="0.4" />
        </svg>
      );

    case "statistics":
      return (
        <svg viewBox="0 0 120 72" className="previewSvg" aria-hidden="true">
          <rect width="120" height="72" rx="6" fill="var(--color-surface-muted)" />
          <rect x="8" y="14" width="32" height="44" rx="4" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="12" y="22" width="24" height="8" rx="2" fill="var(--color-primary)" />
          <rect x="12" y="36" width="20" height="4" rx="1" fill="var(--color-text-muted)" opacity="0.6" />

          <rect x="44" y="14" width="32" height="44" rx="4" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="48" y="22" width="24" height="8" rx="2" fill="var(--color-primary)" />
          <rect x="48" y="36" width="20" height="4" rx="1" fill="var(--color-text-muted)" opacity="0.6" />

          <rect x="80" y="14" width="32" height="44" rx="4" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="84" y="22" width="24" height="8" rx="2" fill="var(--color-primary)" />
          <rect x="84" y="36" width="20" height="4" rx="1" fill="var(--color-text-muted)" opacity="0.6" />
        </svg>
      );

    case "downloads":
      return (
        <svg viewBox="0 0 120 72" className="previewSvg" aria-hidden="true">
          <rect width="120" height="72" rx="6" fill="var(--color-surface-muted)" />
          <rect x="10" y="12" width="100" height="20" rx="3" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="18" y="18" width="12" height="8" rx="1" fill="var(--color-danger)" />
          <rect x="36" y="20" width="45" height="4" rx="1" fill="var(--color-primary)" />
          <path d="M96 22v4m-2-2l2 2 2-2" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />

          <rect x="10" y="38" width="100" height="20" rx="3" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <rect x="18" y="44" width="12" height="8" rx="1" fill="var(--color-primary)" />
          <rect x="36" y="46" width="45" height="4" rx="1" fill="var(--color-text)" opacity="0.7" />
          <path d="M96 48v4m-2-2l2 2 2-2" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
}
