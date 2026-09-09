import { describe, expect, it } from "vitest";

import {
  compactVisualQuery,
  createVisualFormData,
  createVisualJson,
} from "./visuals.request";

describe("visual request builders", () => {
  it("keeps only documented list filters and never includes search", () => {
    expect(
      compactVisualQuery({ type: "link", section_id: 2, author: 4, page: 3 }),
    ).toEqual({ type: "link", section_id: 2, author: 4, page: 3 });
  });

  it("builds upload FormData using contract field names without conflicts", () => {
    const form = createVisualFormData({
      title: "مرئية",
      type: "upload",
      file: { name: "clip.mp4", type: "video/mp4", size: 12 } as File,
      section_id: 2,
    });
    expect(form.get("title")).toBe("مرئية");
    expect(form.get("type")).toBe("upload");
    expect(form.get("file")).toBeTruthy();
    expect(form.get("url")).toBeNull();
  });

  it("builds text-only link updates as JSON and omits empty files", () => {
    expect(
      createVisualJson({
        title: "رابط",
        type: "link",
        url: "https://example.com",
      }),
    ).toEqual({ title: "رابط", type: "link", url: "https://example.com" });
  });
});
