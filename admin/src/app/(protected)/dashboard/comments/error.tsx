"use client";

import { ErrorState } from "@/shared/components/ui";

export default function CommentsError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <ErrorState
      title="تعذر فتح إدارة التعليقات"
      description="حدث خطأ غير متوقع أثناء تجهيز الصفحة. حاول مرة أخرى."
      onRetry={unstable_retry}
    />
  );
}
