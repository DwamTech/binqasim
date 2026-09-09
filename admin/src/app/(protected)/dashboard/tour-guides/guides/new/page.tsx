import type { Metadata } from "next";

import { TourGuideForm } from "@/features/tour-guides/presentation/tour-guide-form";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "إضافة مرشد سياحي" };

export default function NewTourGuidePage() {
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إدارة المرشدين السياحيين"
          title="إضافة مرشد سياحي"
          description="أنشئ ملفًا مهنيًا متكاملًا يظهر للزائر عند اختيار مرشد الرحلة."
        />
      }
    >
      <TourGuideForm mode="create" />
    </PageContainer>
  );
}
