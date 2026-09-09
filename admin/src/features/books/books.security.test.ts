import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("Books read security boundaries", () => {
  const productionSources = [
    "src/features/books/application/books.service.ts",
    "src/features/books/infrastructure/books.repository.ts",
    "src/features/books/presentation/books-list-view.tsx",
    "src/app/(protected)/dashboard/books/page.tsx",
    "src/app/(protected)/dashboard/books/new/page.tsx",
    "src/app/(protected)/dashboard/books/[id]/page.tsx",
    "src/app/(protected)/dashboard/books/[id]/edit/page.tsx",
    "src/app/(protected)/dashboard/books/series/page.tsx",
    "src/app/(protected)/dashboard/books/series/[id]/page.tsx",
  ].map(source);
  const pageSources = productionSources.slice(3);

  it("uses no public Books, rating, or ViewCounter contract", () => {
    for (const content of productionSources) {
      expect(content).not.toContain('"/library/books');
      expect(content).not.toContain("`/library/books");
      expect(content).not.toMatch(/\/rate\b/);
      expect(content).not.toContain("ViewCounter");
    }
  });

  it("keeps tokens and backend origins out of Books presentation", () => {
    for (const content of pageSources) {
      expect(content).not.toContain('"use client"');
      expect(content).not.toContain("sessionCookieName");
      expect(content).not.toContain("BACKEND_API_URL");
      expect(content).not.toMatch(/\btoken\b/i);
    }
  });

  it("keeps every Books page behind the delegated permission", () => {
    for (const content of pageSources) {
      expect(content).toContain('requireDashboardPermission("books.manage")');
    }
  });

  it("protects every browser mutation with same-origin BFF routes", () => {
    for (const path of [
      "src/app/api/books/route.ts",
      "src/app/api/books/[id]/route.ts",
      "src/app/api/books/series/route.ts",
      "src/app/api/books/series/[id]/route.ts",
    ]) {
      expect(source(path)).toContain("isSameOriginMutation");
    }
  });
});
