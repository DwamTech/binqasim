import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("scientific library route integration", () => {
  const pages = [
    "src/app/(protected)/dashboard/library/page.tsx",
    "src/app/(protected)/dashboard/library/new/page.tsx",
    "src/app/(protected)/dashboard/library/[id]/page.tsx",
    "src/app/(protected)/dashboard/library/[id]/edit/page.tsx",
  ].map(source);

  it("keeps the optional library routes independent from the shared books feature", () => {
    for (const page of pages) {
      expect(page).toContain("features/scientific-library");
      expect(page).not.toContain("features/books");
      expect(page).toContain('requireDashboardPermission("books.manage")');
    }
  });

  it("guards the BFF by module state and same-origin mutation checks", () => {
    const collectionRoute = source(
      "src/app/api/scientific-library/items/route.ts",
    );
    const itemRoute = source(
      "src/app/api/scientific-library/items/[id]/route.ts",
    );
    for (const route of [collectionRoute, itemRoute]) {
      expect(route).toContain("disabledScientificLibraryResponse");
      expect(route).toContain("isSameOriginMutation");
    }
  });
});
