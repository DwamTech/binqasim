import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageEditor } from "@/features/pages/presentation/page-editor";
export default async function PagesEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireDashboardPermission("pages.view");
  const { id } = await params;
  return <PageEditor id={id} actor={actor} />;
}
