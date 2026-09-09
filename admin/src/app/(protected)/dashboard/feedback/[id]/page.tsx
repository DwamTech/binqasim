import { notFound } from "next/navigation";

import { FeedbackDetailView } from "@/features/feedback/components/feedback-detail-view";
import { requireDashboardAdmin } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardAdmin();
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="صوت المستفيد"
          title="تفاصيل الطلب"
          description="راجع المحتوى وبيانات التواصل وحدّث مسار المعالجة."
        />
      }
    >
      <FeedbackDetailView id={id} />
    </PageContainer>
  );
}
