import { describe, expect, it } from "vitest";

import { mapVisualMediaWithBackend } from "./visuals.media-mapper";

const backendUrl = "https://cms.example.test/api";

describe("visual media mapper", () => {
  it("keeps absolute video and thumbnail URLs", () => {
    const visual = mapVisualMediaWithBackend(
      {
        id: 1,
        title: "مرئية",
        type: "upload",
        file_path: "https://cdn.example.test/video.mp4",
        thumbnail: "https://cdn.example.test/thumb.jpg",
      },
      backendUrl,
    );
    expect(visual.file).toBe("https://cdn.example.test/video.mp4");
    expect(visual.file_path).toBe("https://cdn.example.test/video.mp4");
    expect(visual.thumbnail).toBe("https://cdn.example.test/thumb.jpg");
  });

  it("resolves relative storage paths and supports the documented file_path field", () => {
    const visual = mapVisualMediaWithBackend(
      {
        id: 1,
        title: "مرئية",
        type: "upload",
        file_path: "visuals/videos/clip.mp4",
        thumbnail: "storage/visuals/thumbnails/thumb.jpg",
      },
      backendUrl,
    );
    expect(visual.file).toBe(
      "https://cms.example.test/storage/visuals/videos/clip.mp4",
    );
    expect(visual.thumbnail).toBe(
      "https://cms.example.test/storage/visuals/thumbnails/thumb.jpg",
    );
  });

  it("keeps missing media nullable without producing a broken URL", () => {
    const visual = mapVisualMediaWithBackend(
      { id: 1, title: "مرئية", type: "upload", file_path: null, thumbnail: "" },
      backendUrl,
    );
    expect(visual.file).toBeNull();
    expect(visual.thumbnail).toBeNull();
  });
});
