"use client";

import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState } from "@/shared/components/ui";

export default function ScientificLibraryError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer>
      <ErrorState
        title="تعذّر فتح المكتبة العلمية"
        description="حدث خطأ غير متوقع أثناء تحميل المحتوى."
        onRetry={reset}
      />
    </PageContainer>
  );
}
