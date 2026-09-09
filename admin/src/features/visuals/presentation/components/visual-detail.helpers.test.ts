import { describe, expect, it } from "vitest";

import { getVisualDetailPreview } from "./visual-detail.helpers";

describe("visual detail preview", () => {
  it("returns video source and resolved thumbnail poster for uploads", () => {
    expect(
      getVisualDetailPreview(
        {
          id: 1,
          title: "فيديو",
          type: "upload",
          file: "https://cdn.example.test/video.mp4",
          thumbnail: "https://cdn.example.test/thumb.jpg",
        },
        undefined,
      ),
    ).toEqual({
      kind: "video",
      src: "https://cdn.example.test/video.mp4",
      poster: "https://cdn.example.test/thumb.jpg",
    });
  });

  it("returns unavailable for missing or failed uploaded video", () => {
    const visual = { id: 1, title: "فيديو", type: "upload" as const };
    expect(getVisualDetailPreview(visual, undefined)).toEqual({
      kind: "unavailable",
    });
    expect(
      getVisualDetailPreview(
        { ...visual, file: "https://cdn.example.test/video.mp4" },
        "https://cdn.example.test/video.mp4",
      ),
    ).toEqual({ kind: "unavailable" });
  });

  it("returns a link-only preview for external visuals", () => {
    expect(
      getVisualDetailPreview(
        {
          id: 2,
          title: "رابط",
          type: "link",
          url: "https://example.test/video",
        },
        undefined,
      ),
    ).toEqual({ kind: "link", href: "https://example.test/video" });
  });
});
