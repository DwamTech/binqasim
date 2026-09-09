import { describe, expect, it } from "vitest";

import { isThumbnailAvailable } from "./visual-thumbnail.helpers";

describe("visual thumbnail fallback", () => {
  it("uses a placeholder for missing or broken sources", () => {
    expect(isThumbnailAvailable(undefined, undefined)).toBe(false);
    expect(isThumbnailAvailable(null, undefined)).toBe(false);
    expect(isThumbnailAvailable("", undefined)).toBe(false);
    expect(
      isThumbnailAvailable(
        "https://cdn.example.test/thumb.jpg",
        "https://cdn.example.test/thumb.jpg",
      ),
    ).toBe(false);
  });

  it("renders a valid thumbnail source until it fails", () => {
    expect(
      isThumbnailAvailable("https://cdn.example.test/thumb.jpg", undefined),
    ).toBe(true);
  });
});
