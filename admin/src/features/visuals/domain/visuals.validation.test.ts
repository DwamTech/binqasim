import { describe, expect, it } from "vitest";

import {
  maxThumbnailBytes,
  maxVideoBytes,
  parseVisualFormData,
  validateVisualInput,
} from "./visuals.validation";

function file(name: string, type: string, size: number): File {
  return { name, type, size } as File;
}

describe("visual input validation", () => {
  it("accepts a supported upload and a secure external link", () => {
    expect(
      validateVisualInput(
        {
          title: "فيديو",
          type: "upload",
          file: file("clip.mp4", "video/mp4", 1024),
        },
        "create",
      ).valid,
    ).toBe(true);
    expect(
      validateVisualInput(
        { title: "رابط", type: "link", url: "https://example.com/video" },
        "create",
      ).valid,
    ).toBe(true);
  });

  it("rejects a file/url conflict and invalid URL protocol", () => {
    const upload = validateVisualInput(
      {
        title: "فيديو",
        type: "upload",
        file: file("clip.mp4", "video/mp4", 1024),
        url: "https://example.com",
      },
      "create",
    );
    const link = validateVisualInput(
      { title: "رابط", type: "link", url: "ftp://example.com" },
      "create",
    );
    expect(upload.fieldErrors.url).toBeTruthy();
    expect(link.fieldErrors.url).toBeTruthy();
  });

  it("reports only the required error when an upload file is missing", () => {
    const result = validateVisualInput(
      { title: "فيديو", type: "upload" },
      "create",
    );
    expect(result.fieldErrors.file).toEqual(["ملف الفيديو مطلوب."]);
  });

  it("reports an unsupported MIME only when a file exists", () => {
    const result = validateVisualInput(
      {
        title: "فيديو",
        type: "upload",
        file: file("clip.txt", "text/plain", 1024),
      },
      "create",
    );
    expect(result.fieldErrors.file).toEqual(["نوع ملف الفيديو غير مدعوم."]);
  });

  it("reports an oversized video without an unrelated type error", () => {
    const result = validateVisualInput(
      {
        title: "فيديو",
        type: "upload",
        file: file("clip.mp4", "video/mp4", maxVideoBytes + 1),
      },
      "create",
    );
    expect(result.fieldErrors.file).toEqual(["حجم الفيديو يتجاوز ٢٠٠MB."]);
  });

  it("does not validate an optional thumbnail until one is selected", () => {
    const result = validateVisualInput(
      {
        title: "فيديو",
        type: "upload",
        file: file("clip.mp4", "video/mp4", 1024),
      },
      "create",
    );
    expect(result.fieldErrors.thumbnail).toBeUndefined();
  });

  it("rejects invalid or oversized video and thumbnail files", () => {
    const result = validateVisualInput(
      {
        title: "فيديو",
        type: "upload",
        file: file("clip.txt", "text/plain", maxVideoBytes + 1),
        thumbnail: file("cover.gif", "image/gif", maxThumbnailBytes + 1),
      },
      "create",
    );
    expect(result.fieldErrors.file).toHaveLength(2);
    expect(result.fieldErrors.thumbnail).toHaveLength(2);
  });

  it("allows an update without replacing existing upload media", () => {
    expect(
      validateVisualInput({ title: "عنوان محدث", type: "upload" }, "update")
        .valid,
    ).toBe(true);
  });

  it("rejects a spoofed MIME type even when its filename has an allowed extension", () => {
    const result = validateVisualInput(
      {
        title: "فيديو",
        type: "upload",
        file: file("clip.mp4", "text/plain", 1024),
        thumbnail: file("cover.png", "text/plain", 1024),
      },
      "create",
    );
    expect(result.fieldErrors.file).toBeTruthy();
    expect(result.fieldErrors.thumbnail).toBeTruthy();
  });

  it("rejects non-numeric ratings instead of silently omitting them", () => {
    const form = new FormData();
    form.set("title", "رابط");
    form.set("type", "link");
    form.set("url", "https://example.com/video");
    form.set("rating", "not-a-number");
    expect(parseVisualFormData(form).fieldErrors?.rating).toBeTruthy();
  });

  it("returns field errors for an empty title and link URL", () => {
    const result = validateVisualInput({ title: "", type: "link" }, "create");
    expect(result.fieldErrors.title).toEqual(["العنوان مطلوب."]);
    expect(result.fieldErrors.url).toEqual(["رابط المرئية مطلوب."]);
  });
});
