import { ARABIC_DISPLAY_LOCALE } from "@/shared/lib/arabic-format";

export function formatBookDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "غير متاح"
    : new Intl.DateTimeFormat(ARABIC_DISPLAY_LOCALE, {
        dateStyle: "medium",
        timeZone: "Africa/Cairo",
      }).format(date);
}

export function safeExternalUrl(value: string | null): string | undefined {
  if (value === null) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}
