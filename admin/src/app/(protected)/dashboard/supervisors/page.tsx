import type { Metadata } from "next";
import { dashboardCopy } from "@/core/config/dashboard-copy";

import { SupervisorsListView } from "@/features/supervisors/components/supervisors-list-view";
import { requireDashboardAdmin } from "@/server/dal/app-auth-guards";

export const metadata: Metadata = {
  title: dashboardCopy.modules.supervisors.pages.list,
};

export default async function SupervisorsPage() {
  await requireDashboardAdmin();
  return <SupervisorsListView />;
}
