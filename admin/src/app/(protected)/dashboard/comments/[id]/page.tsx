import { notFound } from "next/navigation";

import { CommentDetailView } from "@/features/comments/presentation/comment-detail-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";

export default async function CommentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardPermission("comments.manage");
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="تفاعل الزوار"
          title="تفاصيل التعليق"
          description="راجع النص الكامل ومصدره والبيانات التقنية قبل اتخاذ قرار المراجعة."
        />
      }
    >
      <CommentDetailView id={id} />
    </PageContainer>
  );
}
