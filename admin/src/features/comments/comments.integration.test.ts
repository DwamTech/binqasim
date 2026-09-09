import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("optional comments vertical slice", () => {
  it("stays disabled by default with an independently configurable label", () => {
    const environment = source(".env.example");
    expect(environment).toContain("DASHBOARD_MODULE_COMMENTS_ENABLED=false");
    expect(environment).toContain(
      "NEXT_PUBLIC_DASHBOARD_MODULE_COMMENTS_LABEL=إدارة التعليقات",
    );
    expect(
      source("src/app/(protected)/dashboard/comments/layout.tsx"),
    ).toContain('requireDashboardModuleEnabled("comments")');
    expect(source("src/app/(protected)/dashboard/comments/page.tsx")).toContain(
      'requireDashboardPermission("comments.manage")',
    );
    expect(
      source("src/app/(protected)/dashboard/comments/[id]/page.tsx"),
    ).toContain('requireDashboardPermission("comments.manage")');
  });

  it("protects every mutation with the module and same-origin gates", () => {
    for (const path of [
      "src/app/api/comments/[id]/approve/route.ts",
      "src/app/api/comments/[id]/route.ts",
      "src/app/api/comments/bulk-delete/route.ts",
    ]) {
      const route = source(path);
      expect(route).toContain("disabledCommentsResponse");
      expect(route).toContain("isSameOriginMutation(request)");
      expect(route).toContain("createAuthBffRequestContext(request).token");
    }
  });

  it("keeps backend endpoints and credentials out of client presentation", () => {
    for (const path of [
      "src/features/comments/presentation/comments-management-view.tsx",
      "src/features/comments/presentation/comment-detail-view.tsx",
      "src/features/comments/application/comments.client.ts",
    ]) {
      const content = source(path);
      expect(content).not.toContain("/admin/comments");
      expect(content).not.toMatch(/authorization|bearer|cms_session/i);
    }
  });

  it("keeps selection, approval and destructive workflows explicit in the UI", () => {
    const list = source(
      "src/features/comments/presentation/comments-management-view.tsx",
    );
    expect(list).toContain("PageSelectionCheckbox");
    expect(list).toContain("bulkDeleteComments");
    expect(list).toContain("approveComment");
    expect(list).toContain("تأكيد الحذف النهائي");
    expect(list).toContain("maxLength={180}");
  });
});
