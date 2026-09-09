import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.isFile() &&
      path.endsWith(".tsx") &&
      !path.endsWith(".test.tsx")
      ? [path]
      : [];
  });
}

describe("responsive table contract", () => {
  it("requires the shared responsive classes and a label for every cell", () => {
    const files = sourceFiles(join(process.cwd(), "src"));
    const violations: string[] = [];

    for (const path of files) {
      const source = readFileSync(path, "utf8");
      if (!source.includes("<table")) continue;

      if (
        !source.includes("ui-responsive-table") ||
        !source.includes("ui-responsive-table-wrap")
      ) {
        violations.push(`${relative(process.cwd(), path)}: missing classes`);
      }

      for (const cell of source.matchAll(/<td(?:\s[^>]*)?>/g)) {
        if (!cell[0].includes("data-label=")) {
          violations.push(
            `${relative(process.cwd(), path)}: ${cell[0]} needs data-label`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("fills the table container without horizontal scrolling and uses cards when narrow", () => {
    const globals = readFileSync(
      join(process.cwd(), "src", "design-system", "styles", "globals.css"),
      "utf8",
    );

    expect(globals).toContain("container-name: responsive-table");
    expect(globals).toContain("overflow: visible !important");
    expect(globals).toContain("inline-size: 100% !important");
    expect(globals).toContain("min-inline-size: 0 !important");
    expect(globals).toContain("@container responsive-table (max-width: 60rem)");
    expect(globals).toContain(".ui-responsive-table tbody tr");
    expect(globals).toContain("content: attr(data-label)");
  });
});
