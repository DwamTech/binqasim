import { FeedbackManagementView } from "@/features/feedback/components/feedback-management-view";
import { requireDashboardAdmin } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";

export default async function FeedbackPage() {
  requireDashboardModuleEnabled("feedback");
  await requireDashboardAdmin();
  return <FeedbackManagementView />;
}
