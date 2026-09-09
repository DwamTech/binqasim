"use client";

import { ErrorState } from "@/shared/components/ui";

export default function ScientificVideosError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <ErrorState
      title="حدث خطأ أثناء تحميل المرئيات"
      description="يمكنك إعادة المحاولة دون مغادرة الصفحة."
      onRetry={reset}
    />
  );
}
