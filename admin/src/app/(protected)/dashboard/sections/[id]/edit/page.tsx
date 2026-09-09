import type { Metadata } from "next";
import { dashboardCopy } from "@/core/config/dashboard-copy";

import { SectionForm } from "@/features/sections/components/section-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export const metadata: Metadata = {
  title: dashboardCopy.modules.sections.pages.edit,
};

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  requireDashboardModuleEnabled("sections");
  await requireDashboardPermission("sections.manage");
  const { id } = await params;
  return <SectionForm mode="edit" sectionId={id} />;
}
