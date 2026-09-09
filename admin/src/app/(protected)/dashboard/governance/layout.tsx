import type { ReactNode } from "react";

import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export default async function GovernanceDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  requireDashboardModuleEnabled("governance");
  await requireDashboardPermission("books.manage");
  return children;
}
