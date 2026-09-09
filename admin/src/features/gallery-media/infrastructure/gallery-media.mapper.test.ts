import { describe, expect, it } from "vitest";
import { mapGalleryMediaItem } from "./gallery-media.mapper";
const base = {
  id: 1,
  type: "image" as const,
  original_name: "image.webp",
  mime_type: "image/webp",
  size: 12,
};
describe("gallery media mapper", () => {
  it("keeps an absolute URL and resolves a relative public-storage path", () => {
    expect(
      mapGalleryMediaItem(
        { ...base, url: "https://cdn.example/image.webp" },
        "https://api.example/api",
      ).url,
    ).toBe("https://cdn.example/image.webp");
    expect(
      mapGalleryMediaItem(
        { ...base, path: "gallery/images/image.webp" },
        "https://api.example/api",
      ).url,
    ).toBe("https://api.example/storage/gallery/images/image.webp");
  });
  it("safely maps missing URLs to null", () =>
    expect(mapGalleryMediaItem(base, "https://api.example").url).toBeNull());
});
