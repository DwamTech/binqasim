import { describe, expect, it } from "vitest";

import { emptyArticleForm } from "./articles.contracts";
import {
  ARTICLE_MAX_IMAGE_BYTES,
  ARTICLE_MAX_VIDEO_BYTES,
  createArticleFormData,
  slugSuggestion,
  validateArticleFiles,
  validateArticleValues,
} from "./articles.media";

function file(name: string, size: number, type: string): File {
  const result = new File([new Uint8Array(Math.min(size, 1))], name, { type });
  Object.defineProperty(result, "size", { value: size });
  return result;
}

describe("article form and media validation", () => {
  it("validates required content while leaving slug generation to the API", () => {
    expect(validateArticleValues(emptyArticleForm)).toMatchObject({
      title: expect.any(Array),
      content: expect.any(Array),
    });
    expect(validateArticleValues(emptyArticleForm)).not.toHaveProperty("slug");
    expect(slugSuggestion(" عنوان مقال جديد! ")).toBe("عنوان-مقال-جديد");
    expect(
      validateArticleValues({
        ...emptyArticleForm,
        title: "Title",
        slug: "title",
        content: "<p><br></p>",
      }),
    ).toHaveProperty("content");
  });

  it("allows unlimited gallery files and enforces the media-specific limits", () => {
    const galleryImages = Array.from({ length: 20 }, (_, index) =>
      file(`${index}.jpg`, ARTICLE_MAX_IMAGE_BYTES, "image/jpeg"),
    );
    expect(
      validateArticleFiles({
        galleryImages,
        audioFiles: [],
        documents: [file("payload.php", 10, "text/x-php")],
        videos: [file("large.mp4", ARTICLE_MAX_VIDEO_BYTES + 1, "video/mp4")],
      }),
    ).toMatchObject({
      videos: expect.any(Array),
      documents: expect.any(Array),
    });
    expect(
      validateArticleFiles({
        galleryImages,
        audioFiles: [],
        documents: [],
        videos: [],
      }),
    ).toEqual({});
    expect(
      validateArticleFiles({
        galleryImages: [],
        audioFiles: [],
        documents: [],
        videos: [file("allowed.mp4", ARTICLE_MAX_VIDEO_BYTES, "video/mp4")],
      }),
    ).toEqual({});
  });

  it("rejects an image above 150 megabytes and forwards unlimited files without base64", () => {
    const files = {
      galleryImages: [
        file("1.jpg", ARTICLE_MAX_IMAGE_BYTES, "image/jpeg"),
        file("2.jpg", ARTICLE_MAX_IMAGE_BYTES, "image/jpeg"),
        file("3.jpg", ARTICLE_MAX_IMAGE_BYTES + 1, "image/jpeg"),
      ],
      audioFiles: [],
      documents: [],
      videos: [],
    };
    expect(validateArticleFiles(files)).toHaveProperty("gallery_images");
    const form = createArticleFormData(
      { ...emptyArticleForm, title: "Title", slug: "title", content: "Body" },
      {
        galleryImages: files.galleryImages.slice(0, 2),
        audioFiles: [],
        documents: [],
        videos: [],
      },
    );
    expect(form.getAll("gallery_images[]")).toHaveLength(2);
    expect(String(form.get("content"))).toBe("Body");
  });

  it("tolerates file state preserved by Fast Refresh from the old form shape", () => {
    const legacyFiles = { galleryImages: [] } as never;

    expect(validateArticleFiles(legacyFiles)).toEqual({});
    expect(createArticleFormData(emptyArticleForm, legacyFiles)).toBeInstanceOf(
      FormData,
    );
  });
});
