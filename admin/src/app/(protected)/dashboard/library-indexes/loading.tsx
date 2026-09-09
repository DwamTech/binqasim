import { PageContainer } from "@/shared/components/layout/page-container";
import { PageSkeleton } from "@/shared/components/ui";

export default function LibraryIndexesLoading() {
  return (
    <PageContainer>
      <div aria-label="جارٍ تحميل طلبات سجلات المكتبة">
        <PageSkeleton />
      </div>
    </PageContainer>
  );
}
