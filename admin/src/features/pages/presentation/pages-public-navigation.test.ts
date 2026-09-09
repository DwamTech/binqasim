import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const source = (file: string) =>
  readFileSync(
    join(process.cwd(), "src/features/pages/presentation", file),
    "utf8",
  );

describe("Pages Dashboard public navigation", () => {
  it("uses only BFF-projected absolute public Page URLs", () => {
    const editor = source("page-editor.tsx");
    const list = source("pages-list-view.tsx");

    expect(editor).toContain("href={page.public_url}");
    expect(list).toContain("href={item.public_url}");
    expect(`${editor}\n${list}`).not.toContain("href={`/pages/${");
  });

  it("delegates Preview popup handling without a relative fallback", () => {
    const editor = source("page-editor.tsx");

    expect(editor).toContain("openPagePreview(");
    expect(editor).not.toContain("window.open(result.preview_url");
    expect(editor).not.toContain("window.location.origin");
  });
});
