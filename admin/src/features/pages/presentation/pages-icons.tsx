import type { SVGProps } from "react";

export type PagesIconName =
  | "add"
  | "archive"
  | "audio"
  | "cards"
  | "cta"
  | "document"
  | "down"
  | "edit"
  | "external"
  | "faq"
  | "gallery"
  | "hero"
  | "history"
  | "image"
  | "imageText"
  | "more"
  | "preview"
  | "publish"
  | "richContent"
  | "save"
  | "search"
  | "statistics"
  | "trash"
  | "up"
  | "video";

const paths: Record<PagesIconName, React.ReactNode> = {
  add: <path d="M12 5v14M5 12h14" />,
  archive: (
    <>
      <path d="M4 7h16M6 7v12h12V7M9 11h6" />
      <path d="m5 4 1-1h12l1 1v3H5V4Z" />
    </>
  ),
  audio: (
    <>
      <path d="M9 18V6l9-2v12" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="15" cy="16" r="3" />
    </>
  ),
  cards: (
    <>
      <rect x="3" y="4" width="8" height="7" rx="1" />
      <rect x="13" y="4" width="8" height="7" rx="1" />
      <rect x="3" y="13" width="8" height="7" rx="1" />
      <rect x="13" y="13" width="8" height="7" rx="1" />
    </>
  ),
  cta: (
    <>
      <path d="M4 6h16v12H4z" />
      <path d="M8 10h8M9 14h6" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  down: <path d="m6 9 6 6 6-6" />,
  edit: (
    <>
      <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
      <path d="m14 7 3 3" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 13v6H5V6h6" />
    </>
  ),
  faq: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9a2.4 2.4 0 1 1 3.5 2.1c-.9.5-1.3 1-1.3 2M12 17h.01" />
    </>
  ),
  gallery: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8" cy="9" r="2" />
      <path d="m4 17 5-5 4 4 2-2 5 4" />
    </>
  ),
  hero: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9h10M7 13h7M7 17h4" />
    </>
  ),
  history: (
    <>
      <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6" />
      <path d="M4 4v5h5M12 8v5l3 2" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m4 17 5-5 4 4 3-3 4 4" />
    </>
  ),
  imageText: (
    <>
      <rect x="3" y="4" width="8" height="16" rx="1" />
      <path d="M14 7h7M14 11h7M14 15h5" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  preview: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  publish: (
    <>
      <path d="M12 19V5M7 10l5-5 5 5" />
      <path d="M5 19h14" />
    </>
  ),
  richContent: (
    <>
      <path d="M5 5h14M5 9h14M5 13h10M5 17h12" />
    </>
  ),
  save: (
    <>
      <path d="M5 3h12l3 3v15H4V3h1Z" />
      <path d="M8 3v6h8V3M8 21v-7h8v7" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  statistics: (
    <>
      <path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
    </>
  ),
  up: <path d="m6 15 6-6 6 6" />,
  video: (
    <>
      <rect x="3" y="5" width="14" height="14" rx="2" />
      <path d="m17 10 4-2v8l-4-2zM9 9l4 3-4 3z" />
    </>
  ),
};

export function PagesIcon({
  name,
  ...props
}: { name: PagesIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
