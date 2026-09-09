import { describe, expect, it } from "vitest";

import { dashboardPermissions } from "../auth/domain/auth.contracts";

import {
  createSupervisorSchema,
  editSupervisorSchema,
  integratedPermissions,
  normalizePermissions,
  normalizeSupervisorQuery,
  permissionGroups,
  reservedPermissions,
  rolePermissionPresets,
  supervisorRoles,
} from "./supervisors.contracts";

describe("supervisors contracts and presets", () => {
  it("matches the canonical roles and permission catalog", () => {
    expect(supervisorRoles).toEqual(["admin", "editor", "author", "reviewer"]);
    expect(
      [...permissionGroups.flatMap((group) => group.permissions)].sort(),
    ).toEqual([...dashboardPermissions].sort());
    expect(reservedPermissions).toEqual(["supervisors.manage", "seo.manage"]);
    expect(integratedPermissions).toEqual([
      "dashboard.view",
      "articles.manage",
      "books.manage",
      "dissertations.manage",
      "library_indexes.manage",
      "comments.manage",
      "listening.manage",
      "hadith_cards.manage",
      "visuals.manage",
      "fatwas.manage",
      "fatwas.view",
      "fatwas.view_details",
      "fatwas.view_private",
      "fatwas.answer",
      "fatwas.update_answer",
      "fatwas.archive",
      "fatwas.restore",
      "gallery.manage",
      "sections.manage",
      // pages.view is the navigation-visible entry for the Pages module (integration: "available").
      // The remaining pages.* permissions are backend-only and are excluded from integratedPermissions.
      "pages.view",
      "supervisors.manage",
      "tour_guides.manage",
      "reports.view",
      "settings.manage",
    ]);
  });

  it("keeps role presets suggestions only and covers expected roles", () => {
    expect(rolePermissionPresets.author).toEqual([
      "dashboard.view",
      "articles.manage",
    ]);
    expect(rolePermissionPresets.editor).toContain("books.manage");
    expect(rolePermissionPresets.reviewer).toEqual([
      "dashboard.view",
      "reports.view",
    ]);
    expect(rolePermissionPresets.admin).toEqual(dashboardPermissions);
  });

  it("rejects unknown roles, unknown permissions, duplicates and password mismatch", () => {
    const base = {
      name: "Supervisor",
      email: "supervisor@example.test",
      role: "editor",
      is_active: true,
      dashboard_permissions: ["books.manage"],
      password: "password123",
      password_confirmation: "password123",
    };
    expect(
      createSupervisorSchema.safeParse({ ...base, role: "manager" }).success,
    ).toBe(false);
    expect(
      createSupervisorSchema.safeParse({
        ...base,
        dashboard_permissions: ["unknown.manage"],
      }).success,
    ).toBe(false);
    expect(
      createSupervisorSchema.safeParse({
        ...base,
        dashboard_permissions: ["books.manage", "books.manage"],
      }).success,
    ).toBe(false);
    expect(
      createSupervisorSchema.safeParse({
        ...base,
        password_confirmation: "different",
      }).success,
    ).toBe(false);
  });

  it("edit preserves permissions across role changes unless preset is explicitly applied", () => {
    const current = {
      name: "Author",
      email: "author@example.test",
      role: "editor",
      is_active: true,
      dashboard_permissions: ["articles.manage"],
    };
    expect(
      editSupervisorSchema.parse({ ...current, role: "reviewer" })
        .dashboard_permissions,
    ).toEqual(["articles.manage"]);
    expect(rolePermissionPresets.reviewer).not.toEqual(
      current.dashboard_permissions,
    );
  });

  it("normalizes duplicates and preserves future-module permissions", () => {
    expect(
      normalizePermissions(["books.manage", "books.manage", "visuals.manage"]),
    ).toEqual(["books.manage", "visuals.manage"]);
  });

  it("normalizes supported server-side query fields and fails closed", () => {
    expect(
      normalizeSupervisorQuery({
        search: "editor",
        role: "editor",
        is_active: "false",
        permission: "books.manage",
        page: "2",
      }),
    ).toEqual({
      search: "editor",
      role: "editor",
      is_active: "false",
      permission: "books.manage",
      page: 2,
    });
    expect(normalizeSupervisorQuery({ role: "root", page: "-1" })).toEqual({
      page: 1,
    });
  });
});
