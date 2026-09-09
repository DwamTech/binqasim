import type { VisualType } from "../../domain/visuals.contracts";
import { formatArabicFileSize } from "@/shared/lib/arabic-format";

export function formatVisualFileSize(size: number): string {
  return formatArabicFileSize(size, size >= 1024 * 1024 ? 1 : 2);
}

export function visualFileSelectionLabel(file: File | undefined): string {
  return file === undefined ? "لم يتم اختيار ملف" : file.name;
}

export function clearTypeSpecificErrors(
  errors: Record<string, string[]>,
  nextType: VisualType,
): Record<string, string[]> {
  const next = { ...errors };
  if (nextType === "link") delete next.file;
  if (nextType === "upload") delete next.url;
  return next;
}
