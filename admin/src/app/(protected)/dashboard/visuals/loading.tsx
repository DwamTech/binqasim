import { PageSkeleton } from "@/shared/components/ui";
import { PageContainer } from "@/shared/components/layout/page-container";

export default function Loading() {
  return (
    <PageContainer>
      <PageSkeleton />
    </PageContainer>
  );
}
