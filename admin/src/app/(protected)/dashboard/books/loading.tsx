import { PageContainer } from "@/shared/components/layout/page-container";
import { PageSkeleton } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
export default function Loading() {
  return (
    <PageContainer>
      <section
        dir="rtl"
        aria-label={`جارٍ تحميل ${dashboardCopy.modules.books.navigation}`}
      >
        <PageSkeleton />
      </section>
    </PageContainer>
  );
}
