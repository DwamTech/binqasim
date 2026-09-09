import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ArticleFormLoader } from "@/features/articles/components/article-form-loader";
import { canCreateArticle } from "@/features/articles/articles.permissions";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { PageContainer } from "@/shared/components/layout/page-container";

export const metadata: Metadata = {
  title: dashboardCopy.modules.articles.pages.create,
};

export default async function NewArticlePage() {
  const actor = await requireDashboardPermission("articles.manage");
  if (!canCreateArticle(actor)) redirect("/dashboard/no-access");
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.articles.navigation}
          title={dashboardCopy.modules.articles.pages.create}
          description="استوديو تحرير متكامل لكتابة محتوى عربي وإنجليزي، تنسيقه، وإثرائه بالوسائط قبل النشر."
        />
      }
    >
      <ArticleFormLoader actor={actor} />
    </PageContainer>
  );
}
