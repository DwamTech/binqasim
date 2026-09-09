import type { ReactNode } from "react";

import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export default async function LibraryDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  requireDashboardModuleEnabled("library");
  await requireDashboardPermission("books.manage");
  return children;
}
