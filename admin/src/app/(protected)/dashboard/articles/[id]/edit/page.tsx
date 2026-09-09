import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ArticleFormLoader } from "@/features/articles/components/article-form-loader";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { PageContainer } from "@/shared/components/layout/page-container";

export const metadata: Metadata = {
  title: dashboardCopy.modules.articles.pages.edit,
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireDashboardPermission("articles.manage");
  if (actor.role !== "admin" && actor.role !== "author")
    redirect("/dashboard/no-access");
  const { id } = await params;
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.articles.navigation}
          title={dashboardCopy.modules.articles.pages.edit}
          description="حدّث الحقول وأضف وسائط جديدة دون إعادة إرسال الوسائط القديمة."
        />
      }
    >
      <ArticleFormLoader actor={actor} articleId={id} />
    </PageContainer>
  );
}
