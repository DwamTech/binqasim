import { describe, expect, it } from "vitest";

import {
  clearTypeSpecificErrors,
  formatVisualFileSize,
  visualFileSelectionLabel,
} from "./visual-form.helpers";

describe("visual form interaction helpers", () => {
  it("uses Arabic empty and selected file labels", () => {
    expect(visualFileSelectionLabel(undefined)).toBe("لم يتم اختيار ملف");
    expect(
      visualFileSelectionLabel({
        name: "clip.mp4",
        size: 10,
        type: "video/mp4",
      } as File),
    ).toBe("clip.mp4");
    expect(formatVisualFileSize(1024 * 1024)).toBe("١٫٠ MB");
  });

  it("clears the incompatible field error when changing visual type", () => {
    expect(
      clearTypeSpecificErrors(
        { file: ["خطأ ملف"], title: ["خطأ عنوان"] },
        "link",
      ),
    ).toEqual({ title: ["خطأ عنوان"] });
    expect(
      clearTypeSpecificErrors(
        { url: ["خطأ رابط"], title: ["خطأ عنوان"] },
        "upload",
      ),
    ).toEqual({ title: ["خطأ عنوان"] });
  });
});
