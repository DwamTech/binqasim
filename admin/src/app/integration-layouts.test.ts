import { describe, expect, it } from "vitest";

import {
  AdminShell,
  type AdminShellProps,
} from "../shared/components/layout/admin-shell";
import { getRootRouteDestination } from "../server/routing/root-route";
import { ProtectedAdminShell } from "./(protected)/_components/protected-admin-shell";

const admin = {
  id: "1",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin" as const,
  isActive: true as const,
  dashboardPermissions: [] as const,
};

describe("integration layouts", () => {
  it("routes authenticated and guest root requests to their semantic destinations", () => {
    expect(getRootRouteDestination({ authenticated: true })).toBe("/dashboard");
    expect(getRootRouteDestination({ authenticated: false })).toBe("/login");
  });

  it("composes the protected dashboard with the real AdminShell contract", () => {
    const element = ProtectedAdminShell({
      admin,
      children: "Protected content",
    });
    const props = element.props as AdminShellProps;

    expect(element.type).toBe(AdminShell);
    expect(props.admin).toEqual(admin);
    expect(props.navigation?.map((item) => item.href)).toContain("/dashboard");
    expect(props.navigation?.map((item) => item.href)).toContain(
      "/dashboard/supervisors",
    );
    expect(props.onLogout).toBeTypeOf("function");
    expect(props.children).toBeTruthy();
  });
});
