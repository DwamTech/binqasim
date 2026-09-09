import type { ReactNode } from "react";

import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export default async function LegacyVisualsDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  requireDashboardModuleEnabled("legacyVisuals");
  await requireDashboardPermission("visuals.manage");
  return children;
}
