import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PagesListView } from "@/features/pages/presentation/pages-list-view";
export default async function PagesDashboardPage() {
  return (
    <PagesListView actor={await requireDashboardPermission("pages.view")} />
  );
}
