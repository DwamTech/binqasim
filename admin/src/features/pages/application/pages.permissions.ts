import type {
  AdminSummary,
  DashboardPermission,
} from "@/features/auth/domain/auth.contracts";

export function canManagePages(
  actor: AdminSummary,
  permission: DashboardPermission,
): boolean {
  return (
    actor.role === "admin" || actor.dashboardPermissions.includes(permission)
  );
}
