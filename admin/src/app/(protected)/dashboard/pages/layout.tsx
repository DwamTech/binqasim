import type { ReactNode } from "react";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";
export default async function PagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  requireDashboardModuleEnabled("pages");
  await requireDashboardPermission("pages.view");
  return children;
}
