import { PageContainer } from "@/shared/components/layout/page-container";
import { PageSkeleton } from "@/shared/components/ui";
export default function Loading() {
  return (
    <PageContainer>
      <PageSkeleton />
    </PageContainer>
  );
}
