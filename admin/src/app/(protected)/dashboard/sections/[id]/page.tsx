import type { Metadata } from "next";
import { dashboardCopy } from "@/core/config/dashboard-copy";

import { SectionDetailView } from "@/features/sections/components/section-detail-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export const metadata: Metadata = {
  title: dashboardCopy.modules.sections.pages.detail,
};

export default async function SectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  requireDashboardModuleEnabled("sections");
  await requireDashboardPermission("sections.manage");
  const { id } = await params;
  return <SectionDetailView sectionId={id} />;
}
