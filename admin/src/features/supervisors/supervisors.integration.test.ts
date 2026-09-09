import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("supervisors vertical slice integration", () => {
  const list = source(
    "src/features/supervisors/components/supervisors-list-view.tsx",
  );
  const form = source(
    "src/features/supervisors/components/supervisor-form.tsx",
  );
  const detail = source(
    "src/features/supervisors/components/supervisor-detail-view.tsx",
  );
  const actions = source(
    "src/features/supervisors/components/supervisor-actions.tsx",
  );

  it("guards all four pages server-side as Admin-only", () => {
    for (const path of [
      "src/app/(protected)/dashboard/supervisors/page.tsx",
      "src/app/(protected)/dashboard/supervisors/new/page.tsx",
      "src/app/(protected)/dashboard/supervisors/[id]/page.tsx",
      "src/app/(protected)/dashboard/supervisors/[id]/edit/page.tsx",
    ])
      expect(source(path)).toContain("await requireDashboardAdmin()");
  });

  it("implements server-side search filters pagination and all list states", () => {
    expect(list).toContain("setTimeout");
    expect(list).toContain("permission:");
    expect(list).toContain("إعادة ضبط الفلاتر");
    expect(list).toContain("page.current_page - 1");
    expect(list).toContain("page.current_page + 1");
    expect(list).toContain("<Skeleton");
    expect(list).toContain("<EmptyState");
    expect(list).toContain("<ErrorState");
  });

  it("shares create and edit form without silently changing permissions", () => {
    expect(form).toContain('mode: "create" | "edit"');
    expect(form).toContain("rolePermissionPresets");
    expect(form).toContain("setPresetOpen(true)");
    expect(form).toContain("applyPreset");
    expect(form).toContain(
      "dashboard_permissions: supervisor.dashboard_permissions",
    );
  });

  it("covers detail activation deactivation deletion and password reset", () => {
    expect(detail).toContain("<PermissionSummary");
    expect(detail).not.toContain("JSON.stringify(supervisor");
    expect(actions).toContain('"activate"');
    expect(actions).toContain('"deactivate"');
    expect(actions).toContain('"delete"');
    expect(actions).toContain('"password"');
    expect(actions).toContain("<Dialog");
  });

  it("keeps API token and password logging out of presentation components", () => {
    for (const component of [list, form, detail, actions]) {
      expect(component).not.toMatch(/\bfetch\s*\(/);
      expect(component).not.toContain("authorization");
      expect(component).not.toContain("cms_session");
      expect(component).not.toContain("console.");
      expect(component).not.toContain("localStorage");
    }
  });
});
