import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const routesRoot = join(process.cwd(), "src/app/api/pages");

function routeFiles(directory = routesRoot): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? routeFiles(path)
      : entry.name === "route.ts"
        ? [relative(process.cwd(), path)]
        : [];
  });
}

const expectedRoutes = [
  "src/app/api/pages/[id]/archive/route.ts",
  "src/app/api/pages/[id]/draft/route.ts",
  "src/app/api/pages/[id]/media/route.ts",
  "src/app/api/pages/[id]/preview/route.ts",
  "src/app/api/pages/[id]/publish/route.ts",
  "src/app/api/pages/[id]/restore-from-archive/route.ts",
  "src/app/api/pages/[id]/revisions/[revisionId]/restore/route.ts",
  "src/app/api/pages/[id]/revisions/[revisionId]/route.ts",
  "src/app/api/pages/[id]/revisions/route.ts",
  "src/app/api/pages/[id]/route.ts",
  "src/app/api/pages/route.ts",
].sort();

const mutationRoutes = expectedRoutes.filter(
  (path) =>
    ![
      "src/app/api/pages/[id]/revisions/[revisionId]/route.ts",
      "src/app/api/pages/[id]/revisions/route.ts",
    ].includes(path),
);

describe("Pages BFF route inventory", () => {
  it("keeps all eleven route files and all fourteen handlers behind the Pages module guard", () => {
    const files = routeFiles().sort();
    expect(files).toEqual(expectedRoutes);

    let handlers = 0;
    let gates = 0;

    for (const file of files) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      const fileHandlers =
        source.match(/export async function (?:GET|POST|PUT|PATCH|DELETE)/g) ??
        [];
      const fileGates = source.match(/pagesModuleDisabledResponse\(\)/g) ?? [];

      expect(source, file).toContain(
        'from "@/features/pages/application/pages-module-guard"',
      );
      expect(fileGates.length, file).toBe(fileHandlers.length);
      handlers += fileHandlers.length;
      gates += fileGates.length;
    }

    expect(handlers).toBe(14);
    expect(gates).toBe(14);
  });

  it("retains same-origin protection on every Pages mutation route", () => {
    for (const file of mutationRoutes) {
      expect(
        readFileSync(join(process.cwd(), file), "utf8"),
        file,
      ).toContain("isSameOriginMutation(request)");
    }
  });

  it("keeps the UI guard and browser client on the Pages-owned BFF boundary", () => {
    const layout = readFileSync(
      join(
        process.cwd(),
        "src/app/(protected)/dashboard/pages/layout.tsx",
      ),
      "utf8",
    );
    const browserClient = readFileSync(
      join(process.cwd(), "src/features/pages/application/pages.client.ts"),
      "utf8",
    );

    expect(layout).toContain('requireDashboardModuleEnabled("pages")');
    expect(browserClient).toContain('"/api/pages"');
    expect(browserClient).not.toContain("/admin/pages");
  });
});
