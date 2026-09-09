import { notFound } from "next/navigation";
import { JoinApplicationFormView } from "@/features/join-applications/components/join-application-form-view";
import {
  isJoinApplicationType,
  joinApplicationTypeLabels,
} from "@/features/join-applications/join-applications.contracts";
import { requireDashboardAdmin } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";

export default async function NewApplicationPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  await requireDashboardAdmin();
  const { type } = await params;
  if (!isJoinApplicationType(type)) notFound();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={joinApplicationTypeLabels[type]}
          title="إضافة طلب جديد"
          description="أدخل بيانات الطلب كاملة، وسيتم إنشاء رقم متابعة تلقائي."
        />
      }
    >
      <JoinApplicationFormView type={type} />
    </PageContainer>
  );
}
