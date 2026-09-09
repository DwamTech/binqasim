import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("library indexes vertical slice", () => {
  it("keeps navigation, routes and public labels independent from other modules", () => {
    expect(source(".env.example")).toContain(
      "DASHBOARD_MODULE_LIBRARY_INDEXES_ENABLED=false",
    );
    expect(source(".env.example")).toContain(
      "NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_INDEXES_LABEL=فهارس المكتبة وسجلات الزوار",
    );
    expect(
      source("src/app/(protected)/dashboard/library-indexes/layout.tsx"),
    ).toContain('requireDashboardModuleEnabled("libraryIndexes")');
    expect(
      source("src/app/(protected)/dashboard/library-indexes/page.tsx"),
    ).toContain('requireDashboardPermission("library_indexes.manage")');
  });

  it("protects both review mutations with feature and same-origin checks", () => {
    for (const action of ["approve", "reject"]) {
      const route = source(
        `src/app/api/library-indexes/submissions/[type]/[id]/${action}/route.ts`,
      );
      expect(route).toContain("unavailableLibraryIndexesResponse");
      expect(route).toContain("unsafeLibraryIndexesMutationResponse");
      expect(route).toContain("createAuthBffRequestContext(request).token");
    }
    expect(
      source(
        "src/features/library-indexes/application/library-indexes-bff.route.ts",
      ),
    ).toContain("isSameOriginMutation");
  });

  it("does not expose backend admin paths or bearer tokens in client views", () => {
    for (const path of [
      "src/features/library-indexes/presentation/library-index-submissions-list-view.tsx",
      "src/features/library-indexes/presentation/library-index-submission-detail-view.tsx",
      "src/features/library-indexes/application/library-indexes.client.ts",
    ]) {
      const content = source(path);
      expect(content).not.toContain("/admin/library-indexes");
      expect(content).not.toMatch(/authorization|bearer|cms_session/i);
    }
  });
});
