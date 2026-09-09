import { redirect } from "next/navigation";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { canManagePages } from "@/features/pages/application/pages.permissions";
import { PageCreateForm } from "@/features/pages/presentation/page-create-form";
export default async function NewPagesDashboardPage() {
  const actor = await requireDashboardPermission("pages.view");
  if (!canManagePages(actor, "pages.create")) redirect("/dashboard/no-access");
  return <PageCreateForm actor={actor} />;
}
