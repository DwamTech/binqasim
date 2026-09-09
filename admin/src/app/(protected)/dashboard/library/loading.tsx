import { PageContainer } from "@/shared/components/layout/page-container";
import { PageSkeleton } from "@/shared/components/ui";

export default function ScientificLibraryLoading() {
  return (
    <PageContainer>
      <div aria-label="جارٍ تحميل المكتبة العلمية">
        <PageSkeleton />
      </div>
    </PageContainer>
  );
}
