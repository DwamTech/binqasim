import { describe, expect, it } from "vitest";
import {
  mergePageSeo,
  pageSeoEditorValues,
  pageSeoShape,
  validateCanonical,
} from "./page-seo";

describe("Pages revision SEO editor contract", () => {
  const base = {
    title: "",
    description: "",
    canonical: "",
    robots: "",
    index: "default" as const,
  };
  it("classifies object, empty list and preserve-only legacy list shapes", () => {
    expect(pageSeoShape({ custom: { nested: true } })).toBe("object");
    expect(pageSeoShape([])).toBe("empty-list");
    expect(pageSeoShape(["legacy"])).toBe("legacy-list");
    expect(mergePageSeo([], base, new Set())).toEqual([]);
    expect(
      mergePageSeo(
        ["legacy"],
        { ...base, title: "Ignored" },
        new Set(["title"]),
      ),
    ).toEqual(["legacy"]);
  });
  it("merges only touched known fields and preserves unknown nested values exactly", () => {
    const original = {
      title: ["legacy"],
      custom: { nested: [1, null, true] },
      unknown: false,
      number: 3,
      nullable: null,
      values: ["keep"],
    };
    expect(
      mergePageSeo(
        original,
        { ...base, title: "New title" },
        new Set(["title"]),
      ),
    ).toEqual({
      title: "New title",
      custom: { nested: [1, null, true] },
      unknown: false,
      number: 3,
      nullable: null,
      values: ["keep"],
    });
    expect(mergePageSeo(original, base, new Set())).toEqual(original);
  });
  it("deletes cleared fields, converts an edited empty list to an object, and keeps index tri-state", () => {
    expect(
      mergePageSeo(
        { title: "Old", description: "Old", index: true, robots: "nofollow" },
        base,
        new Set(["title", "description", "index"]),
      ),
    ).toEqual({ robots: "nofollow" });
    expect(
      mergePageSeo(
        [],
        { ...base, title: "About", index: "block" },
        new Set(["title", "index"]),
      ),
    ).toEqual({ title: "About", index: false });
    expect(pageSeoEditorValues({ index: true }).index).toBe("allow");
    expect(pageSeoEditorValues({ index: false }).index).toBe("block");
  });
  it("preserves invalid legacy known values until their field is explicitly changed", () => {
    const original = {
      index: "legacy",
      robots: ["legacy"],
      title: ["legacy"],
      custom: true,
    };
    expect(
      mergePageSeo(original, pageSeoEditorValues(original), new Set()),
    ).toEqual(original);
    expect(
      mergePageSeo(
        original,
        { ...base, index: "allow", robots: "noindex" },
        new Set(["index", "robots"]),
      ),
    ).toEqual({
      index: true,
      robots: "noindex",
      title: ["legacy"],
      custom: true,
    });
  });
  it("does not synchronize robots and index while editing either field", () => {
    expect(
      mergePageSeo(
        { robots: "nofollow" },
        { ...base, index: "block" },
        new Set(["index"]),
      ),
    ).toEqual({ robots: "nofollow", index: false });
    expect(
      mergePageSeo(
        { index: true },
        { ...base, robots: "noindex" },
        new Set(["robots"]),
      ),
    ).toEqual({ index: true, robots: "noindex" });
  });
  it("accepts only absolute HTTP(S) canonical values", () => {
    expect(validateCanonical("https://example.com/pages/about")).toBe(true);
    expect(validateCanonical("http://example.test/x")).toBe(true);
    for (const value of [
      "/pages/about",
      "#details",
      "javascript:alert(1)",
      "//example.com/x",
      "ftp://example.com/x",
    ])
      expect(validateCanonical(value)).toBe(false);
  });
});
