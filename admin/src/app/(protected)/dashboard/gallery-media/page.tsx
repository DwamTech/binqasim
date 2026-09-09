import Link from "next/link";
import { getGalleryMedia } from "@/features/gallery-media/application/gallery-media.service";
import type { GalleryMediaListQuery } from "@/features/gallery-media/domain/gallery-media.contracts";
import { isGalleryMediaType } from "@/features/gallery-media/domain/gallery-media.validation";
import {
  GalleryMediaFilters,
  GalleryMediaGrid,
} from "@/features/gallery-media/presentation/components/gallery-media-grid";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { requireDashboardModuleEnabled } from "@/server/dal/dashboard-module-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
export const metadata: Metadata = {
  title: dashboardCopy.modules.gallery.pages.list,
};
import styles from "@/features/gallery-media/presentation/gallery-media.module.css";

function positive(value: string | string[] | undefined) {
  const number = Number(typeof value === "string" ? value : undefined);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}
export default async function GalleryMediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  requireDashboardModuleEnabled("galleryMedia");
  await requireDashboardPermission("gallery.manage");
  const values = await searchParams;
  const candidate = typeof values.type === "string" ? values.type : "";
  const page = positive(values.page);
  const query: GalleryMediaListQuery = {
    ...(isGalleryMediaType(candidate) ? { type: candidate } : {}),
    ...(page === undefined ? {} : { page }),
  };
  const media = await getGalleryMedia(query);
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.gallery.navigation}
          title={dashboardCopy.modules.gallery.pages.list}
          description="رفع وإدارة الصور ومقاطع الفيديو المستخدمة في الموقع."
          actions={
            <Link
              href="/dashboard/gallery-media/new"
              className="ui-button ui-button--primary ui-focus"
            >
              إضافة وسائط
            </Link>
          }
        />
      }
    >
      {!media.success ? (
        <ErrorState
          title="تعذّر تحميل معرض الوسائط"
          description="حاول إعادة تحميل الصفحة. إذا استمرت المشكلة، تحقق من اتصال الخدمة."
        />
      ) : (
        <div className={styles.stack}>
          <GalleryMediaFilters key={query.type ?? "all"} type={query.type} />
          <GalleryMediaGrid paginator={media.data} query={query} />
        </div>
      )}
    </PageContainer>
  );
}
import type { Metadata } from "next";
