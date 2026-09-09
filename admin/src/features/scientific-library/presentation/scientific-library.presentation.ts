import type {
  ScientificLibraryOption,
  ScientificLibraryStatus,
} from "../domain/scientific-library.contracts";

export function safeLibraryUrl(
  value: string | null | undefined,
  allowRelative = false,
): string | undefined {
  if (!value) return undefined;
  const candidate = value.trim();
  if (allowRelative && candidate.startsWith("/") && !candidate.startsWith("//"))
    return candidate;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function optionLabel(
  options: ScientificLibraryOption[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function optionsWithCurrentValue(
  options: ScientificLibraryOption[],
  current: string,
): ScientificLibraryOption[] {
  if (!current || options.some((option) => option.value === current))
    return options;
  return [{ value: current, label: `${current} — قيمة حالية` }, ...options];
}

export const scientificLibraryStatusLabels: Record<
  ScientificLibraryStatus,
  string
> = {
  draft: "مسودة",
  scheduled: "مجدول",
  published: "منشور",
};

export function formatScientificLibraryDate(
  value: string | null | undefined,
): string {
  if (!value) return "غير محدد";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "غير متاح"
    : new Intl.DateTimeFormat("ar-EG-u-nu-arab", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export function fileNameFromPath(value: string | null | undefined): string {
  if (!value) return "ملف محفوظ بأمان";
  const clean = value.split("?")[0]?.replace(/\\/g, "/") ?? "";
  return decodeURIComponent(
    clean.split("/").filter(Boolean).at(-1) ?? "ملف محفوظ",
  );
}
