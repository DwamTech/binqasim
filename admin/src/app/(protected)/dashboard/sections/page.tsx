import type { Metadata } from "next";
import { dashboardCopy } from "@/core/config/dashboard-copy";

import { SectionsListView } from "@/features/sections/components/sections-list-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export const metadata: Metadata = {
  title: dashboardCopy.modules.sections.pages.list,
};

export default async function SectionsPage() {
  requireDashboardModuleEnabled("sections");
  await requireDashboardPermission("sections.manage");
  return <SectionsListView />;
}
