import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

function filesUnder(root: string, extension: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return filesUnder(path, extension);
    return entry.isFile() && entry.name.endsWith(extension) ? [path] : [];
  });
}

describe("configuration boundaries", () => {
  it("keeps brand colors out of feature styles", () => {
    const sourceRoot = join(process.cwd(), "src");
    const themePath = join(sourceRoot, "design-system", "styles", "theme.css");
    const brandColor =
      /#(?:d9bb5d|937133|2b393a|1b3a36|156d54|01231c)|rgb\((?:21 109 84|1 35 28|217 187 93|147 113 51|27 58 54|43 57 58) \//i;
    const leaks = filesUnder(sourceRoot, ".css")
      .filter((path) => path !== themePath)
      .filter((path) => brandColor.test(readFileSync(path, "utf8")))
      .map((path) => relative(process.cwd(), path));

    expect(leaks).toEqual([]);
  });

  it("keeps configurable navigation labels in the environment schema", () => {
    const sourceRoot = join(process.cwd(), "src");
    const allowedPath = join(sourceRoot, "core", "env", "client.ts");
    const configurableLabels =
      /إدارة (?:المقالات|الكتب|المرئيات|معرض الوسائط|الأقسام|المشرفين|الإعدادات)/;
    const leaks = filesUnder(sourceRoot, ".ts")
      .concat(filesUnder(sourceRoot, ".tsx"))
      .filter((path) => path !== allowedPath && !path.endsWith(".test.ts"))
      .filter(
        (path) =>
          !path.endsWith(".test.tsx") &&
          configurableLabels.test(readFileSync(path, "utf8")),
      )
      .map((path) => relative(process.cwd(), path));

    expect(leaks).toEqual([]);
  });
});
