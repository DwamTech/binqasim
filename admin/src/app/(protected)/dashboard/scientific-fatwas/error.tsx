"use client";

import { ErrorState } from "@/shared/components/ui";

export default function ScientificFatwasError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <ErrorState
      title="حدث خطأ أثناء تحميل الفتاوى"
      description="يمكنك إعادة المحاولة دون مغادرة الصفحة."
      onRetry={reset}
    />
  );
}
