import { describe, expect, it } from "vitest";
import {
  shouldRedirectAfterGalleryUpload,
  uploadGalleryMediaSequentially,
  type UploadQueueItem,
} from "./gallery-media-upload.helpers";
function file(name: string) {
  return new File(["x"], name, { type: "image/png" });
}
describe("sequential gallery upload", () => {
  it("uploads in order and never retries successful files", async () => {
    const items: UploadQueueItem[] = [
      { file: file("one.png"), state: "success" },
      { file: file("two.png"), state: "pending" },
      { file: file("three.png"), state: "failed" },
    ];
    const calls: string[] = [];
    const states: string[] = [];
    await uploadGalleryMediaSequentially(
      items,
      async (candidate) => {
        calls.push(candidate.name);
        return candidate.name === "two.png"
          ? { success: true, message: "ok" }
          : {
              success: false,
              message: "failed",
              fieldErrors: { "files.0": ["رفض الملف"] },
            };
      },
      (index, item) =>
        states.push(`${index}:${item.state}:${item.error ?? ""}`),
    );
    expect(calls).toEqual(["two.png", "three.png"]);
    expect(states).toEqual([
      "1:uploading:",
      "1:success:",
      "2:uploading:",
      "2:failed:رفض الملف",
    ]);
  });
  it("keeps a single-file FormData contract at the action boundary", () => {
    const formData = new FormData();
    formData.append("files[]", file("image.png"));
    expect([...formData.keys()]).toEqual(["files[]"]);
  });
  it("redirects only when all attempted files succeed", () => {
    expect(
      shouldRedirectAfterGalleryUpload({ succeeded: 1, attempted: 1 }),
    ).toBe(true);
    expect(
      shouldRedirectAfterGalleryUpload({ succeeded: 2, attempted: 2 }),
    ).toBe(true);
    expect(
      shouldRedirectAfterGalleryUpload({ succeeded: 1, attempted: 2 }),
    ).toBe(false);
  });
});
