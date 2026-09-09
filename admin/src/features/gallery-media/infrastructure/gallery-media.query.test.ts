import { describe, expect, it } from "vitest";
import { compactGalleryMediaQuery } from "./gallery-media.query";
describe("gallery media query", () => {
  it("uses only documented filters and drops empty values", () => {
    expect(
      compactGalleryMediaQuery({ type: "image", page: 2, per_page: 24 }),
    ).toEqual({ type: "image", page: 2, per_page: 24 });
    expect(compactGalleryMediaQuery({})).toEqual({});
  });
});
