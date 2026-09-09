"use client";

import { PageContainer } from "@/shared/components/layout/page-container";
import { Button, ErrorState } from "@/shared/components/ui";

export default function FeedbackError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer>
      <ErrorState
        title="تعذر فتح إدارة الشكاوى والمقترحات"
        description="حدث خطأ غير متوقع أثناء تجهيز الصفحة."
      />
      <Button variant="secondary" onClick={reset}>
        إعادة المحاولة
      </Button>
    </PageContainer>
  );
}
