"use client";

import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState } from "@/shared/components/ui";

export default function ArticlesError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <PageContainer>
      <ErrorState
        title="تعذر فتح موديول المقالات"
        description="حدث خطأ غير متوقع. أعد المحاولة دون تسجيل الخروج."
        onRetry={reset}
      />
    </PageContainer>
  );
}
