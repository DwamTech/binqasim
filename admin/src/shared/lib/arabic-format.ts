export const ARABIC_DISPLAY_LOCALE = "ar-EG-u-nu-arab";

const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

export function toArabicDigits(value: string | number | bigint): string {
  return String(value).replace(/\d/g, (digit) => arabicDigits[Number(digit)] ?? digit);
}

export function formatArabicNumber(
  value: number | bigint,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(ARABIC_DISPLAY_LOCALE, options).format(value);
}

export function formatArabicFileSize(bytes: number, fractionDigits = 2): string {
  const safeBytes = Number.isFinite(bytes) ? Math.max(0, bytes) : 0;
  const megabyte = 1024 * 1024;

  if (safeBytes < megabyte) {
    return `${formatArabicNumber(Math.max(1, Math.round(safeBytes / 1024)))} KB`;
  }

  return `${formatArabicNumber(safeBytes / megabyte, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })} MB`;
}

export function formatArabicDate(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(ARABIC_DISPLAY_LOCALE, options).format(
    new Date(value),
  );
}
