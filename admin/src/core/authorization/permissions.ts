export type Permission = "dashboard.view" | "settings.view" | "settings.update";

// Backend authorization remains the final authority for protected operations.
export function hasPermission(
  permissions: readonly Permission[],
  permission: Permission,
): boolean {
  return permissions.includes(permission);
}
