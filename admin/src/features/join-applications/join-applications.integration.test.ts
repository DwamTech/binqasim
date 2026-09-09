import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const source = (path: string) => readFileSync(join(root, path), "utf8");

describe("join applications integration", () => {
  it("registers the admin-only dashboard group and all four children", () => {
    const modules = source("src/core/authorization/dashboard-modules.ts");
    const navigation = source(
      "src/shared/components/layout/dashboard-navigation.ts",
    );
    expect(modules).toContain('route: "/dashboard/applications"');
    for (const type of ["members", "volunteers", "guides", "jobs"]) {
      expect(navigation).toContain(`/${type}`);
    }
  });

  it("guards every dashboard page with the admin contract", () => {
    for (const path of [
      "src/app/(protected)/dashboard/applications/page.tsx",
      "src/app/(protected)/dashboard/applications/[type]/page.tsx",
      "src/app/(protected)/dashboard/applications/[type]/new/page.tsx",
      "src/app/(protected)/dashboard/applications/[type]/[id]/page.tsx",
      "src/app/(protected)/dashboard/applications/[type]/[id]/edit/page.tsx",
    ]) {
      expect(source(path)).toContain("requireDashboardAdmin()");
    }
  });

  it("keeps backend authorization server-side and protects mutations by origin", () => {
    const bff = source(
      "src/features/join-applications/join-applications-bff.core.ts",
    );
    expect(bff).toContain("authorization: `Bearer ${token}`");
    expect(bff).toContain("/admin/join-applications/");
    for (const path of [
      "src/app/api/join-applications/[type]/route.ts",
      "src/app/api/join-applications/[type]/[id]/route.ts",
      "src/app/api/join-applications/[type]/[id]/status/route.ts",
    ]) {
      expect(source(path)).toContain("isSameOriginMutation");
    }
  });
});
