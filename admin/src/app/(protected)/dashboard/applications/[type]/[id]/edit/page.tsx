import { notFound } from "next/navigation";
import { JoinApplicationFormView } from "@/features/join-applications/components/join-application-form-view";
import {
  isJoinApplicationType,
  joinApplicationTypeLabels,
} from "@/features/join-applications/join-applications.contracts";
import { requireDashboardAdmin } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  await requireDashboardAdmin();
  const { type, id } = await params;
  if (!isJoinApplicationType(type) || !/^[1-9]\d*$/.test(id)) notFound();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={joinApplicationTypeLabels[type]}
          title="تعديل بيانات الطلب"
          description="حدّث البيانات المطلوبة مع الحفاظ على رقم الطلب وسجل الحالة."
        />
      }
    >
      <JoinApplicationFormView type={type} id={id} />
    </PageContainer>
  );
}
