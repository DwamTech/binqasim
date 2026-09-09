import type { Metadata } from "next";
import { dashboardCopy } from "@/core/config/dashboard-copy";

import { SupervisorDetailView } from "@/features/supervisors/components/supervisor-detail-view";
import { requireDashboardAdmin } from "@/server/dal/app-auth-guards";

export const metadata: Metadata = {
  title: dashboardCopy.modules.supervisors.pages.detail,
};

export default async function SupervisorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardAdmin();
  return <SupervisorDetailView supervisorId={(await params).id} />;
}
