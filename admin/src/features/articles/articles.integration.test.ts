import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { dashboardModuleByPermission } from "../../core/authorization/dashboard-modules";

const root = resolve(process.cwd(), "src");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("articles vertical slice integration", () => {
  it("registers the complete dashboard route family as available", () => {
    const articleModule = dashboardModuleByPermission["articles.manage"];
    expect(articleModule).toMatchObject({
      integration: "available",
      route: "/dashboard/articles",
      navigationLabel: "إدارة المقالات",
    });
    for (const route of [
      "app/(protected)/dashboard/articles/page.tsx",
      "app/(protected)/dashboard/articles/new/page.tsx",
      "app/(protected)/dashboard/articles/[id]/page.tsx",
      "app/(protected)/dashboard/articles/[id]/edit/page.tsx",
    ]) {
      expect(source(route)).toContain(
        'requireDashboardPermission("articles.manage")',
      );
    }
  });

  it("enforces same-origin on every article BFF mutation", () => {
    for (const route of [
      "app/api/articles/route.ts",
      "app/api/articles/[id]/route.ts",
      "app/api/articles/[id]/media/[mediaId]/route.ts",
      "app/api/articles/[id]/status/route.ts",
    ]) {
      expect(source(route)).toContain("isSameOriginMutation(request)");
    }
  });

  it("keeps Sanctum tokens server-only and never uses public reads for management", () => {
    const feature = [
      source("features/articles/articles.client.ts"),
      source("features/articles/articles-bff.core.ts"),
    ].join("\n");
    expect(feature).not.toMatch(/localStorage|sessionStorage/);
    expect(source("features/articles/articles.client.ts")).not.toMatch(
      /authorization|bearer/i,
    );
    expect(source("features/articles/articles-bff.core.ts")).toContain(
      '"/admin/articles"',
    );
    expect(source("features/articles/articles-bff.core.ts")).not.toMatch(
      /client\.request\("\/articles",\s*\{\s*method:\s*"GET"/,
    );
  });
});
