import { toArabicDigits } from "@/shared/lib/arabic-format";

export function formatRemainingSeconds(remainingSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(remainingSeconds));
  return toArabicDigits(
    `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`,
  );
}
