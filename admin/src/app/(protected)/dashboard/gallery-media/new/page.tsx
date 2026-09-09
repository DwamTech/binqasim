import { GalleryMediaUploadForm } from "@/features/gallery-media/presentation/components/gallery-media-upload-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
export const metadata: Metadata = {
  title: dashboardCopy.modules.gallery.pages.create,
};
export default async function NewGalleryMediaPage() {
  requireDashboardModuleEnabled("galleryMedia");
  await requireDashboardPermission("gallery.manage");
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.gallery.navigation}
          title={dashboardCopy.modules.gallery.pages.create}
          description="اختر صورة أو فيديو واحدًا أو عدة ملفات للرفع إلى المعرض."
        />
      }
    >
      <GalleryMediaUploadForm />
    </PageContainer>
  );
}
import type { Metadata } from "next";
