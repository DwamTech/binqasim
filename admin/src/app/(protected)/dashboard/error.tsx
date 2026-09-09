"use client";

import { PageContainer } from "../../../shared/components/layout/page-container";
import { ErrorState } from "../../../shared/components/ui";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer>
      <ErrorState
        title="تعذّر فتح الصفحة"
        description="حدث خطأ غير متوقع أثناء تحميل محتوى لوحة التحكم."
        onRetry={reset}
      />
    </PageContainer>
  );
}
