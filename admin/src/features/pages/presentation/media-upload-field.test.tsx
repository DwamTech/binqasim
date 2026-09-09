import { readFileSync } from "node:fs";
import { join } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { PageMedia } from "../domain/pages.contracts";
import {
  MediaUploadField,
  resolveMediaUploadOutcome,
} from "./media-upload-field";

const source = readFileSync(
  join(process.cwd(), "src/features/pages/presentation/media-upload-field.tsx"),
  "utf8",
);
const css = readFileSync(
  join(
    process.cwd(),
    "src/features/pages/presentation/media-upload-field.module.css",
  ),
  "utf8",
);

const media = (type: PageMedia["type"]): PageMedia => ({
  id: 17,
  type,
  url: `https://cdn.example.test/pages/1/${type}`,
  mime_type:
    type === "image"
      ? "image/webp"
      : type === "video"
        ? "video/mp4"
        : type === "audio"
          ? "audio/mpeg"
          : "application/pdf",
  name: `${type}-asset.${type === "document" ? "pdf" : "bin"}`,
  size: 2048,
});

function render(
  kind: PageMedia["type"],
  value?: PageMedia,
  error?: string,
  uploading = false,
): string {
  return renderToStaticMarkup(
    <MediaUploadField
      label="وسائط القسم"
      accept="*/*"
      guidance="صيغة آمنة فقط."
      media={value}
      kind={kind}
      uploading={uploading}
      disabled={false}
      error={error}
      onFile={() => undefined}
    />,
  );
}

describe("MediaUploadField", () => {
  it("uses an explicit non-submit button and never navigates from the media control", () => {
    const markup = render("image");

    expect(markup).toContain('type="button"');
    expect(markup).toContain('type="file"');
    expect(source).toContain("event.preventDefault()");
    expect(source).toContain("event.stopPropagation()");
    expect(source).not.toMatch(/router\.(push|replace)|window\.location|<form/);
    expect(source).not.toContain("<label");
  });

  it("keeps the native input accessible while using a bounded inline chooser", () => {
    const markup = render("image");

    expect(markup).toContain("aria-controls=");
    expect(markup).toContain('aria-label="اختيار صورة"');
    expect(markup).toContain('accept="*/*"');
    expect(markup).toContain('tabindex="-1"');
    expect(markup).toContain("أضف صورة لهذا القسم");
  });

  it("shows media-specific inline upload progress without removing the editor", () => {
    const markup = render("video", undefined, undefined, true);

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("جارٍ رفع الفيديو…");
    expect(markup).toContain('disabled=""');
  });

  it.each([
    ["image", "اختيار صورة"],
    ["video", "اختيار فيديو"],
    ["audio", "اختيار ملف صوتي"],
    ["document", "اختيار مستند"],
  ] as const)("provides %s-specific empty and choose UX", (kind, label) => {
    expect(render(kind)).toContain(label);
  });

  it("renders image, video, audio and document-specific previews safely", () => {
    expect(render("image", media("image"))).toContain("<img");
    expect(render("video", media("video"))).toContain("<video");
    expect(render("audio", media("audio"))).toContain("<audio");
    expect(render("document", media("document"))).not.toMatch(
      /<(img|video|audio)/,
    );
    expect(render("document", media("document"))).toContain(
      "document-asset.pdf",
    );
  });

  it("renders stable media metadata without storage implementation details", () => {
    const markup = render("image", media("image"));

    expect(markup).toContain("image-asset.bin");
    // mime_type is intentionally omitted from the summary row (cleaner non-technical UX).
    expect(markup).not.toContain("media.path");
    expect(markup).toContain("2.0 كيلوبايت");
    expect(source).not.toContain("media.path");
    expect(source).not.toContain("media.disk");
  });

  it("treats a changed stable ID as a successful replacement", () => {
    expect(
      resolveMediaUploadOutcome({
        hasSelection: true,
        observedUploading: true,
        uploading: false,
        previousMediaId: 17,
        currentMediaId: 18,
      }),
    ).toBe("success");
  });

  it("treats a completed upload without a new ID as failure so prior media remains", () => {
    expect(
      resolveMediaUploadOutcome({
        hasSelection: true,
        observedUploading: true,
        uploading: false,
        previousMediaId: 17,
        currentMediaId: 17,
      }),
    ).toBe("failure");
    expect(source).toContain("بقيت الصورة السابقة كما هي");
    const failedReplacement = render(
      "image",
      media("image"),
      "تعذر استبدال الصورة.",
    );
    expect(failedReplacement).toContain("image-asset.bin");
    expect(failedReplacement).toContain("تعذر استبدال الصورة.");
  });

  it("keeps the pending state until upload activity has actually completed", () => {
    expect(
      resolveMediaUploadOutcome({
        hasSelection: true,
        observedUploading: false,
        uploading: false,
        previousMediaId: 17,
        currentMediaId: 17,
      }),
    ).toBe("pending");
    expect(
      resolveMediaUploadOutcome({
        hasSelection: true,
        observedUploading: true,
        uploading: true,
        previousMediaId: 17,
        currentMediaId: 17,
      }),
    ).toBe("pending");
  });

  it("exposes inline polite loading and assertive failure regions", () => {
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('role="alert"');
    expect(source).toContain("جارٍ رفع الصورة…");
    expect(source).toContain("تعذر رفع الصورة");
    expect(
      render("image", media("image"), "تعذر رفع الصورة الآمنة."),
    ).toContain("تعذر رفع الصورة الآمنة.");
  });

  it("bounds media previews and reflows actions on small screens", () => {
    // 16rem max height for tighter image previews (deliberate design choice)
    expect(css).toContain("max-block-size: 16rem");
    expect(css).toContain("object-fit: cover");
    expect(css).toContain("@media (max-width: 40rem)");
    expect(css).toContain("inline-size: 100%");
  });
});
