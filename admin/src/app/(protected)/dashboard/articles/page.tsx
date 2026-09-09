import { ArticlesListView } from "@/features/articles/components/articles-list-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";

export const metadata: Metadata = {
  title: dashboardCopy.modules.articles.pages.list,
};

export default async function ArticlesPage() {
  const actor = await requireDashboardPermission("articles.manage");
  return <ArticlesListView actor={actor} />;
}
import type { Metadata } from "next";
import { dashboardCopy } from "@/core/config/dashboard-copy";
