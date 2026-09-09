import type { Metadata } from "next";

import { isDashboardAdmin } from "@/core/authorization/dashboard-access";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { SettingsPageView } from "@/features/settings/components/settings-page-view";
import { normalizeSettingsTab } from "@/features/settings/settings.contracts";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";

export const metadata: Metadata = {
  title: dashboardCopy.modules.settings.pages.list,
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const actor = await requireDashboardPermission("settings.manage");
  const isAdmin = isDashboardAdmin(actor);
  const tab = normalizeSettingsTab((await searchParams).tab, isAdmin);

  return <SettingsPageView initialTab={tab} isAdmin={isAdmin} />;
}
