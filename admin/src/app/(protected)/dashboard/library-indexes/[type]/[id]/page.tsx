import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getLibraryIndexSubmission } from "@/features/library-indexes/application/library-indexes.service";
import { isLibraryIndexSubmissionType } from "@/features/library-indexes/domain/library-indexes.schemas";
import { LibraryIndexSubmissionDetailView } from "@/features/library-indexes/presentation/library-index-submission-detail-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تفاصيل طلب السجل" };

export default async function LibraryIndexSubmissionDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  await requireDashboardPermission("library_indexes.manage");
  const { type, id } = await params;
  if (!isLibraryIndexSubmissionType(type) || !/^[1-9]\d*$/.test(id)) {
    notFound();
  }
  const result = await getLibraryIndexSubmission(type, id);
  if (!result.success && result.error.status === 404) notFound();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.libraryIndexes.navigation}
          title="تفاصيل طلب السجل"
          description="راجع البيانات الأصلية وسجل المراجعة واتخذ قرار النشر من شاشة واحدة واضحة."
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذر تحميل الطلب"
          description="تحقق من صلاحية الوصول أو اتصال الخدمة ثم حاول مرة أخرى."
        />
      ) : (
        <LibraryIndexSubmissionDetailView initialItem={result.data} />
      )}
    </PageContainer>
  );
}
