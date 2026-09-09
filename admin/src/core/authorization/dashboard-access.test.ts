import { describe, expect, it } from "vitest";

import {
  canAccessDashboardRoute,
  hasDashboardPermission,
  resolveDashboardLandingRoute,
} from "./dashboard-access";

const editor = {
  id: "2",
  name: "Editor",
  email: "editor@example.com",
  role: "editor" as const,
  isActive: true as const,
  dashboardPermissions: ["dashboard.view"] as const,
};
const admin = {
  ...editor,
  role: "admin" as const,
  dashboardPermissions: [] as const,
};
const visualsEditor = {
  ...editor,
  dashboardPermissions: ["visuals.manage"] as const,
};
const booksEditor = {
  ...editor,
  dashboardPermissions: ["books.manage"] as const,
};
describe("dashboard access policy", () => {
  it("gives active admins explicit full access", () => {
    expect(canAccessDashboardRoute(admin, "/dashboard/unknown")).toBe(true);
  });
  it("requires exact mapped permission for supervisors", () => {
    expect(hasDashboardPermission(editor, "dashboard.view")).toBe(true);
    expect(canAccessDashboardRoute(editor, "/dashboard")).toBe(true);
    expect(canAccessDashboardRoute(editor, "/dashboard/unknown")).toBe(false);
  });
  it("protects every visuals route with visuals.manage", () => {
    expect(canAccessDashboardRoute(visualsEditor, "/dashboard/visuals")).toBe(
      true,
    );
    expect(
      canAccessDashboardRoute(visualsEditor, "/dashboard/visuals/12/edit"),
    ).toBe(true);
    expect(canAccessDashboardRoute(editor, "/dashboard/visuals")).toBe(false);
  });
  it("protects the complete articles route family with articles.manage", () => {
    const articlesActor = {
      ...editor,
      dashboardPermissions: ["articles.manage"] as const,
    };
    expect(canAccessDashboardRoute(articlesActor, "/dashboard/articles")).toBe(
      true,
    );
    expect(
      canAccessDashboardRoute(articlesActor, "/dashboard/articles/12/edit"),
    ).toBe(true);
    expect(canAccessDashboardRoute(editor, "/dashboard/articles")).toBe(false);
  });
  it("protects gallery media routes with gallery.manage", () => {
    const galleryActor = {
      ...editor,
      dashboardPermissions: ["gallery.manage"] as const,
    };
    expect(
      canAccessDashboardRoute(galleryActor, "/dashboard/gallery-media/new"),
    ).toBe(true);
    expect(canAccessDashboardRoute(editor, "/dashboard/gallery-media")).toBe(
      false,
    );
  });
  it("allows delegated fatwa readers into the inbox without catalogue management", () => {
    const fatwaReader = {
      ...editor,
      dashboardPermissions: ["fatwas.view", "fatwas.view_details"] as const,
    };
    expect(
      canAccessDashboardRoute(
        fatwaReader,
        "/dashboard/scientific-fatwas/inbox",
      ),
    ).toBe(true);
    expect(
      canAccessDashboardRoute(
        fatwaReader,
        "/dashboard/scientific-fatwas/inbox/12",
      ),
    ).toBe(true);
    expect(
      canAccessDashboardRoute(fatwaReader, "/dashboard/scientific-fatwas"),
    ).toBe(false);
  });
  it("treats fatwas.manage as a superset for inbox routes and workflow capabilities", () => {
    const fatwaManager = {
      ...editor,
      dashboardPermissions: ["fatwas.manage"] as const,
    };

    expect(
      canAccessDashboardRoute(
        fatwaManager,
        "/dashboard/scientific-fatwas/inbox",
      ),
    ).toBe(true);
    expect(
      canAccessDashboardRoute(
        fatwaManager,
        "/dashboard/scientific-fatwas/inbox/12",
      ),
    ).toBe(true);

    for (const permission of [
      "fatwas.view",
      "fatwas.view_details",
      "fatwas.view_private",
      "fatwas.answer",
      "fatwas.update_answer",
      "fatwas.archive",
      "fatwas.restore",
    ] as const) {
      expect(hasDashboardPermission(fatwaManager, permission)).toBe(true);
    }
    expect(hasDashboardPermission(fatwaManager, "articles.manage")).toBe(false);
  });
  it("applies books.manage to Books and nested Series routes", () => {
    expect(canAccessDashboardRoute(booksEditor, "/dashboard/books")).toBe(true);
    expect(
      canAccessDashboardRoute(booksEditor, "/dashboard/books/series/12"),
    ).toBe(true);
    expect(canAccessDashboardRoute(editor, "/dashboard/books")).toBe(false);
    expect(canAccessDashboardRoute(admin, "/dashboard/books/series")).toBe(
      true,
    );
  });
  it("keeps feedback management and its details admin-only", () => {
    expect(canAccessDashboardRoute(admin, "/dashboard/feedback")).toBe(true);
    expect(canAccessDashboardRoute(admin, "/dashboard/feedback/12")).toBe(true);
    expect(canAccessDashboardRoute(editor, "/dashboard/feedback")).toBe(false);
  });
  it("lets every dashboard actor manage their own account", () => {
    expect(
      canAccessDashboardRoute(
        { ...editor, dashboardPermissions: [] },
        "/dashboard/account",
      ),
    ).toBe(true);
  });
  it("applies sections.manage to the full sections route family", () => {
    const sectionsActor = {
      ...editor,
      dashboardPermissions: ["sections.manage"] as const,
    };
    expect(canAccessDashboardRoute(sectionsActor, "/dashboard/sections")).toBe(
      true,
    );
    expect(
      canAccessDashboardRoute(sectionsActor, "/dashboard/sections/12/edit"),
    ).toBe(true);
    expect(canAccessDashboardRoute(editor, "/dashboard/sections")).toBe(false);
  });
  it("applies settings.manage to settings while admin-only tabs stay a feature rule", () => {
    const settingsActor = {
      ...editor,
      dashboardPermissions: ["settings.manage"] as const,
    };
    expect(canAccessDashboardRoute(settingsActor, "/dashboard/settings")).toBe(
      true,
    );
    expect(canAccessDashboardRoute(editor, "/dashboard/settings")).toBe(false);
  });
  it("protects the complete library indexes route family", () => {
    const registryManager = {
      ...editor,
      dashboardPermissions: ["library_indexes.manage"] as const,
    };
    expect(
      canAccessDashboardRoute(registryManager, "/dashboard/library-indexes"),
    ).toBe(true);
    expect(
      canAccessDashboardRoute(
        registryManager,
        "/dashboard/library-indexes/golden_visit/12",
      ),
    ).toBe(true);
    expect(canAccessDashboardRoute(editor, "/dashboard/library-indexes")).toBe(
      false,
    );
  });
  it("protects comments list and detail routes with comments.manage", () => {
    const commentsManager = {
      ...editor,
      dashboardPermissions: ["comments.manage"] as const,
    };
    expect(
      canAccessDashboardRoute(commentsManager, "/dashboard/comments"),
    ).toBe(true);
    expect(
      canAccessDashboardRoute(commentsManager, "/dashboard/comments/12"),
    ).toBe(true);
    expect(canAccessDashboardRoute(editor, "/dashboard/comments")).toBe(false);
  });
  it("keeps supervisors admin-only even when the reserved permission is stored", () => {
    const delegated = {
      ...editor,
      dashboardPermissions: ["supervisors.manage"] as const,
    };
    expect(canAccessDashboardRoute(delegated, "/dashboard/supervisors")).toBe(
      false,
    );
    expect(canAccessDashboardRoute(admin, "/dashboard/supervisors")).toBe(true);
  });
  it("uses a controlled no-access destination when no usable route exists", () => {
    expect(
      resolveDashboardLandingRoute({ ...editor, dashboardPermissions: [] }),
    ).toBe("/dashboard/no-access");
  });

  it("honors only registered, permitted internal callbacks", () => {
    expect(
      resolveDashboardLandingRoute(editor, "/dashboard?tab=overview"),
    ).toBe("/dashboard?tab=overview");
    expect(resolveDashboardLandingRoute(editor, "//evil.example")).toBe(
      "/dashboard",
    );
    expect(resolveDashboardLandingRoute(editor, "/dashboard/unknown")).toBe(
      "/dashboard",
    );
  });
});
