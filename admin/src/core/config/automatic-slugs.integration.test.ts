import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const formSources = [
  "features/articles/components/article-form.tsx",
  "features/books/presentation/book-form.tsx",
  "features/books/presentation/library-category-manager.tsx",
  "features/dissertations/presentation/dissertation-form.tsx",
  "features/listening/presentation/listening-series-form.tsx",
  "features/listening/presentation/listening-session-form.tsx",
  "features/scientific-library/presentation/scientific-library-form.tsx",
  "features/scientific-videos/presentation/scientific-video-form.tsx",
  "features/hadith-cards/presentation/hadith-cards-workspace.tsx",
] as const;

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), "src", path), "utf8");

describe("automatic public slugs", () => {
  it.each(formSources)("does not expose a manual slug input in %s", (path) => {
    expect(source(path)).not.toMatch(/(?:label="|<span>)الرابط المختصر/u);
  });

  it("keeps the hadith cards color variant out of editor controls", () => {
    const workspace = source(
      "features/hadith-cards/presentation/hadith-cards-workspace.tsx",
    );
    expect(workspace).not.toContain("المظهر اللوني");
    expect(workspace).not.toContain("كل الألوان");
  });
});
