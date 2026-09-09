import type { ReactNode } from "react";

import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export default async function ListeningDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  requireDashboardModuleEnabled("listening");
  await requireDashboardPermission("listening.manage");
  return children;
}
