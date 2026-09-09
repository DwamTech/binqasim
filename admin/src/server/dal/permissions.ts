import type { AdminRole } from "@/features/auth/domain/auth.contracts";

export const adminPermissions = [
  "dashboard:access",
  "sessions:manage",
] as const;

export type AdminPermission = (typeof adminPermissions)[number];

const rolePermissions: Record<AdminRole, readonly AdminPermission[]> = {
  admin: ["dashboard:access"],
  editor: [],
  author: [],
  reviewer: [],
  super_admin: ["dashboard:access", "sessions:manage"],
};

// Backend authorization remains the final authority for every protected action.
export function hasPermission(
  role: AdminRole,
  permission: AdminPermission,
): boolean {
  return rolePermissions[role].includes(permission);
}
