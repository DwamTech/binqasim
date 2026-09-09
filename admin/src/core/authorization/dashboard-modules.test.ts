import { describe, expect, it } from "vitest";

import { dashboardPermissions } from "../../features/auth/domain/auth.contracts";

import { dashboardRoutePermissions } from "./dashboard-access";
import {
  dashboardModuleByPermission,
  dashboardModules,
  getDashboardModuleStatus,
} from "./dashboard-modules";

describe("dashboard module registry", () => {
  it("documents every canonical permission exactly once", () => {
    expect(dashboardModules.map((module) => module.permission).sort()).toEqual(
      [...dashboardPermissions].sort(),
    );
    expect(
      new Set(
        dashboardModules.map((dashboardModule) => dashboardModule.permission),
      ).size,
    ).toBe(dashboardPermissions.length);
  });

  it("maps every available module route to its real access contract", () => {
    for (const dashboardModule of dashboardModules.filter(
      (item) => item.integration === "available" && item.route !== undefined,
    )) {
      expect(
        dashboardModule.route,
        `${dashboardModule.permission} must declare its route`,
      ).toBe(
        dashboardModule.permission === "gallery.manage"
          ? "/dashboard/gallery-media"
          : dashboardModule.permission === "books.manage"
            ? "/dashboard/governance"
            : dashboardModule.permission === "fatwas.manage"
              ? "/dashboard/scientific-fatwas"
              : dashboardModule.permission === "library_indexes.manage"
                ? "/dashboard/library-indexes"
                : dashboardModule.permission === "hadith_cards.manage"
                  ? "/dashboard/hadith-cards"
                  : dashboardModule.permission === "tour_guides.manage"
                    ? "/dashboard/tour-guides"
                    : `/dashboard${dashboardModule.permission === "dashboard.view" ? "" : `/${dashboardModule.permission.split(".")[0]}`}`,
      );
      expect(dashboardRoutePermissions[dashboardModule.route ?? ""]).toBe(
        dashboardModule.delegation === "admin-only"
          ? "admin"
          : dashboardModule.permission,
      );
      expect(dashboardModule.navigationLabel).toBeTruthy();
    }
  });

  it("keeps implemented, backend-only and deferred states explicit", () => {
    expect(dashboardModuleByPermission["visuals.manage"].integration).toBe(
      "available",
    );
    expect(getDashboardModuleStatus("visuals.manage")).toBeNull();
    expect(dashboardModuleByPermission["articles.manage"].integration).toBe(
      "available",
    );
    expect(getDashboardModuleStatus("articles.manage")).toBeNull();
    expect(getDashboardModuleStatus("reports.view")).toBeNull();
    expect(dashboardModuleByPermission["fatwas.view"].integration).toBe(
      "available",
    );
    expect(getDashboardModuleStatus("fatwas.view")).toBeNull();
    expect(getDashboardModuleStatus("seo.manage")).toBe(
      "محجوزة — التنفيذ مؤجل",
    );
    expect(getDashboardModuleStatus("supervisors.manage")).toBe(
      "متاحة للمدير فقط",
    );
  });
});
