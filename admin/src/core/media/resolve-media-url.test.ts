import { describe, expect, it } from "vitest";

import { resolveMediaUrl } from "./resolve-media-url";

describe("resolveMediaUrl", () => {
  it("preserves absolute HTTP URLs and resolves storage paths", () => {
    expect(
      resolveMediaUrl(
        "https://cdn.example.test/image.jpg",
        "https://api.example.test",
      ),
    ).toBe("https://cdn.example.test/image.jpg");
    expect(
      resolveMediaUrl("/storage/files/a.pdf", "https://api.example.test/api"),
    ).toBe("https://api.example.test/storage/files/a.pdf");
    expect(
      resolveMediaUrl("gallery/images/file.webp", "https://api.example.test"),
    ).toBe("https://api.example.test/storage/gallery/images/file.webp");
    expect(
      resolveMediaUrl("storage/files/a.pdf", "https://api.example.test"),
    ).toBe("https://api.example.test/storage/files/a.pdf");
  });

  it("rejects unsafe schemes", () => {
    expect(
      resolveMediaUrl("javascript:alert(1)", "https://api.example.test"),
    ).toBeUndefined();
    expect(
      resolveMediaUrl("data:text/plain,unsafe", "https://api.example.test"),
    ).toBeUndefined();
    expect(
      resolveMediaUrl("//evil.example/file", "https://api.example.test"),
    ).toBeUndefined();
  });
});
