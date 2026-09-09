import { describe, expect, it } from "vitest";

import { dashboardPermissions } from "@/features/auth/domain/auth.contracts";

import { dashboardModules } from "./dashboard-modules";
import { disabledDashboardModuleFlags } from "../config/dashboard-module-flags";
import { validateServerEnvironment } from "../env/server.schema";
import { getDashboardNavigation } from "@/shared/components/layout/dashboard-navigation";

describe("Pages Dashboard registration", () => {
  const pagesPermissions = [
    "pages.view",
    "pages.create",
    "pages.update",
    "pages.publish",
    "pages.preview",
    "pages.archive",
    "pages.restore",
    "pages.delete",
  ] as const;

  it("registers exactly the approved Pages permissions and catalog metadata", () => {
    expect(
      dashboardPermissions.filter((permission) =>
        permission.startsWith("pages."),
      ),
    ).toEqual(pagesPermissions);

    const pagesModule = dashboardModules.find(
      (module) => module.permission === "pages.view",
    );
    expect(pagesModule).toMatchObject({
      permission: "pages.view",
      route: "/dashboard/pages",
      featureFlag: "pages",
      navigationLabel: "إدارة الصفحات",
      integration: "available",
    });
    expect(
      dashboardModules
        .filter((module) => module.permission.startsWith("pages."))
        .map((module) => module.permission),
    ).toEqual(pagesPermissions);
  });

  it("exposes Pages navigation only when both the flag and permission allow it", () => {
    const actor = {
      id: "2",
      name: "Pages Editor",
      email: "pages.editor@example.com",
      role: "editor" as const,
      isActive: true as const,
      dashboardPermissions: ["pages.view"] as const,
    };

    expect(
      getDashboardNavigation(actor, {
        ...disabledDashboardModuleFlags,
        pages: true,
      }).find(
        (item) => item.href === "/dashboard/pages",
      ),
    ).toMatchObject({ label: "إدارة الصفحات" });
    expect(
      getDashboardNavigation(actor, {
        ...disabledDashboardModuleFlags,
        pages: false,
      }),
    ).toEqual([]);
    expect(
      getDashboardNavigation(
        { ...actor, dashboardPermissions: [] },
        { ...disabledDashboardModuleFlags, pages: true },
      ),
    ).toEqual([]);
  });

  it("keeps Pages disabled unless the deployment explicitly enables it", () => {
    expect(disabledDashboardModuleFlags.pages).toBe(false);
    expect(validateServerEnvironment({}).DASHBOARD_MODULE_PAGES_ENABLED).toBe(
      false,
    );
    expect(
      validateServerEnvironment({ DASHBOARD_MODULE_PAGES_ENABLED: "false" })
        .DASHBOARD_MODULE_PAGES_ENABLED,
    ).toBe(false);
    expect(
      validateServerEnvironment({
        DASHBOARD_MODULE_PAGES_ENABLED: "true",
        PUBLIC_FRONTEND_ORIGIN: "https://public.example.com",
      }).DASHBOARD_MODULE_PAGES_ENABLED,
    ).toBe(true);
  });
});
