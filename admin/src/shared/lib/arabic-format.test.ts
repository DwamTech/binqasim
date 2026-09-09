import { describe, expect, it } from "vitest";

import {
  formatArabicFileSize,
  formatArabicNumber,
  toArabicDigits,
} from "./arabic-format";

describe("Arabic display formatting", () => {
  it("converts every western digit without changing the surrounding text", () => {
    expect(toArabicDigits("BOOK-2026 / 015558558579")).toBe(
      "BOOK-٢٠٢٦ / ٠١٥٥٥٨٥٥٨٥٧٩",
    );
  });

  it("formats numbers with Arabic digits", () => {
    expect(formatArabicNumber(123456)).toMatch(/[١٢٣٤٥٦]/);
    expect(formatArabicNumber(123456)).not.toMatch(/\d/);
  });

  it("formats file sizes with Arabic digits", () => {
    expect(formatArabicFileSize(1536 * 1024, 1)).toBe("١٫٥ MB");
    expect(formatArabicFileSize(140 * 1024)).toBe("١٤٠ KB");
  });
});
