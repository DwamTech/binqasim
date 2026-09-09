import type {
  AdminSummary,
  DashboardPermission,
} from "@/features/auth/domain/auth.contracts";

import {
  adminOnlyDashboardModules,
  dashboardRouteAliases,
  dashboardModules,
} from "./dashboard-modules";

export const dashboardRoutePermissions = {
  ...Object.fromEntries(
    dashboardModules
      .filter((module) => module.route !== undefined)
      .map((module) => [
        module.route,
        module.delegation === "admin-only" ? "admin" : module.permission,
      ]),
  ),
  ...Object.fromEntries(
    adminOnlyDashboardModules.map((module) => [module.route, "admin"]),
  ),
  ...Object.fromEntries(
    dashboardRouteAliases.map((module) => [module.route, module.permission]),
  ),
  "/dashboard/programs": "books.manage",
  "/dashboard/books": "books.manage",
  "/dashboard/scientific-fatwas/inbox": "fatwas.view",
  "/dashboard/account": null,
} as Readonly<Record<string, DashboardPermission | "admin" | null>>;

export function isDashboardAdmin(actor: AdminSummary): boolean {
  return actor.role === "admin";
}

export function hasDashboardPermission(
  actor: AdminSummary,
  permission: DashboardPermission,
): boolean {
  if (isDashboardAdmin(actor)) return true;
  if (actor.dashboardPermissions.includes(permission)) return true;

  // The backend treats fatwas.manage as the workflow-wide permission. Mirror
  // that contract centrally so route guards and action capabilities cannot
  // disagree for supervisors who manage the complete fatwa module.
  return (
    permission.startsWith("fatwas.") &&
    actor.dashboardPermissions.includes("fatwas.manage")
  );
}

export function canAccessDashboardRoute(
  actor: AdminSummary,
  pathname: string,
): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const registeredRoute = Object.keys(dashboardRoutePermissions)
    .sort((left, right) => right.length - left.length)
    .find(
      (route) =>
        normalized === route ||
        (route !== "/dashboard" && normalized.startsWith(`${route}/`)),
    );
  const permission =
    registeredRoute === undefined
      ? undefined
      : dashboardRoutePermissions[registeredRoute];
  if (permission === undefined) return isDashboardAdmin(actor);
  if (permission === null) return true;
  if (permission === "admin") return isDashboardAdmin(actor);
  return hasDashboardPermission(actor, permission);
}

export function resolveDashboardLandingRoute(
  actor: AdminSummary,
  requestedPath?: string,
): string {
  if (requestedPath !== undefined) {
    try {
      const url = new URL(requestedPath, "https://dashboard.local");
      const normalized = url.pathname.replace(/\/+$/, "") || "/";
      if (
        url.origin === "https://dashboard.local" &&
        ["/dashboard", "/dashboard/account", "/dashboard/no-access"].includes(
          normalized,
        ) &&
        (normalized === "/dashboard/no-access" ||
          canAccessDashboardRoute(actor, normalized))
      ) {
        return `${normalized}${url.search}`;
      }
    } catch {
      // Unsafe callbacks use the deterministic fallback below.
    }
  }
  if (canAccessDashboardRoute(actor, "/dashboard")) return "/dashboard";
  return "/dashboard/no-access";
}
