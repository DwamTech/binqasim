import { notFound } from "next/navigation";
import { JoinApplicationsListView } from "@/features/join-applications/components/join-applications-list-view";
import { isJoinApplicationType } from "@/features/join-applications/join-applications.contracts";
import { requireDashboardAdmin } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export default async function ApplicationsListPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  requireDashboardModuleEnabled("applications");
  await requireDashboardAdmin();
  const { type } = await params;
  if (!isJoinApplicationType(type)) notFound();
  return <JoinApplicationsListView type={type} />;
}
