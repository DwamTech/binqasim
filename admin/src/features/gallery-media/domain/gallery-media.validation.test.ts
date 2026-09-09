import { describe, expect, it } from "vitest";
import {
  galleryMediaMaxBytes,
  validateGalleryMediaFiles,
} from "./gallery-media.validation";

function file(name: string, type: string, size = 1) {
  return new File([new Uint8Array(size)], name, { type, lastModified: 1 });
}
describe("gallery media validation", () => {
  it("accepts documented image and video MIME types", () => {
    expect(
      validateGalleryMediaFiles([
        file("image.webp", "image/webp"),
        file("clip.mp4", "video/mp4"),
      ]),
    ).toEqual({});
  });
  it.each([
    ["photo.jpg", "image/jpeg"],
    ["photo.png", "image/png"],
    ["photo.webp", "image/webp"],
    ["clip.mp4", "video/mp4"],
    ["clip.mov", "video/quicktime"],
  ])("accepts %s", (name, type) =>
    expect(validateGalleryMediaFiles([file(name, type)])).toEqual({}),
  );
  it.each([
    ["bad.svg", "image/svg+xml"],
    ["sound.mp3", "audio/mpeg"],
    ["document.pdf", "application/pdf"],
    ["page.html", "text/html"],
    ["script.js", "application/javascript"],
    ["tool.exe", "application/x-msdownload"],
  ])("rejects unsupported %s", (name, type) =>
    expect(validateGalleryMediaFiles([file(name, type)])["files.0"]?.[0]).toBe(
      "نوع الملف غير مدعوم.",
    ),
  );
  it("rejects unsupported, empty, oversized, and duplicate selections", () => {
    const duplicate = file("same.png", "image/png");
    const result = validateGalleryMediaFiles([
      file("bad.svg", "image/svg+xml"),
      new File([], "empty.png", { type: "image/png" }),
      file("large.mp4", "video/mp4", galleryMediaMaxBytes + 1),
      duplicate,
      duplicate,
    ]);
    expect(result["files.0"]?.[0]).toBe("نوع الملف غير مدعوم.");
    expect(result["files.1"]?.[0]).toBe("الملف فارغ ولا يمكن رفعه.");
    expect(result["files.2"]?.[0]).toContain("٢٠٠MB");
    expect(result["files.4"]?.[0]).toContain("مسبقًا");
  });
  it("requires at least one file", () =>
    expect(validateGalleryMediaFiles([]).files?.[0]).toContain("ملف واحد"));
});
