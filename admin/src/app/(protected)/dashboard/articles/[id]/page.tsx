import { ArticleDetailView } from "@/features/articles/components/article-detail-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";

export const metadata: Metadata = {
  title: dashboardCopy.modules.articles.pages.detail,
};

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireDashboardPermission("articles.manage");
  const { id } = await params;
  return <ArticleDetailView articleId={id} actor={actor} />;
}
import type { Metadata } from "next";
import { dashboardCopy } from "@/core/config/dashboard-copy";
