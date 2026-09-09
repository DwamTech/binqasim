import type { Metadata } from "next";

import { TourGuideForm } from "@/features/tour-guides/presentation/tour-guide-form";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تعديل المرشد السياحي" };

export default async function EditTourGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة المرشدين السياحيين"
          title="تعديل بيانات المرشد"
          description="حدّث الملف المهني والصورة والمسارات وحالة ظهور المرشد للزوار."
        />
      }
    >
      <TourGuideForm mode="edit" guideId={id} />
    </PageContainer>
  );
}
