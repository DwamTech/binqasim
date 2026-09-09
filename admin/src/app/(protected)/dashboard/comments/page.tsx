import { CommentsManagementView } from "@/features/comments/presentation/comments-management-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";

export default async function CommentsPage() {
  await requireDashboardPermission("comments.manage");
  return <CommentsManagementView />;
}
