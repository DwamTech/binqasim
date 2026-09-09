import { getAdminBookSeries } from "@/features/books/application/books.service";
import { BookSeriesManager } from "@/features/books/presentation/book-series-manager";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
export const metadata: Metadata = {
  title: dashboardCopy.modules.books.series.manage,
};
export default async function SeriesPage() {
  await requireDashboardPermission("books.manage");
  const result = await getAdminBookSeries();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.books.navigation}
          title={dashboardCopy.modules.books.series.manage}
          description="أنشئ السلاسل وعدّلها واربط بها الكتب متعددة الأجزاء."
        />
      }
    >
      <section dir="rtl" aria-label="سلاسل الكتب">
        {!result.success ? (
          <ErrorState
            title="تعذّر تحميل السلاسل"
            description="حاول مرة أخرى لاحقًا."
          />
        ) : (
          <BookSeriesManager initial={result.data} />
        )}
      </section>
    </PageContainer>
  );
}
import type { Metadata } from "next";
