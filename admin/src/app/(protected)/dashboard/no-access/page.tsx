import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";

export default function DashboardNoAccessPage() {
  return (
    <PageContainer>
      <HeroSection
        eyebrow="الصلاحيات"
        title="لا توجد صلاحيات للوحة التحكم"
        description="تواصل مع مدير النظام لمنح صلاحية مناسبة."
      />
    </PageContainer>
  );
}
