import type { ReactNode } from "react";

import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export default async function LibraryIndexesDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  requireDashboardModuleEnabled("libraryIndexes");
  await requireDashboardPermission("library_indexes.manage");
  return children;
}
