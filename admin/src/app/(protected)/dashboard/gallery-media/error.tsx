"use client";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState } from "@/shared/components/ui";
export default function GalleryMediaError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer>
      <ErrorState
        title="تعذّر فتح معرض الوسائط"
        description="حاول مرة أخرى."
        onRetry={reset}
      />
    </PageContainer>
  );
}
