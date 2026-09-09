import type { Metadata } from "next";
import { dashboardCopy } from "@/core/config/dashboard-copy";

import { SectionForm } from "@/features/sections/components/section-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export const metadata: Metadata = {
  title: dashboardCopy.modules.sections.pages.create,
};

export default async function NewSectionPage() {
  requireDashboardModuleEnabled("sections");
  await requireDashboardPermission("sections.manage");
  return <SectionForm mode="create" />;
}
