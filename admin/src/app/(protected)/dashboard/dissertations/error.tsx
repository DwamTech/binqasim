"use client";

import { ErrorState } from "@/shared/components/ui";

export default function DissertationsError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="حدث خطأ أثناء تحميل الرسائل العلمية"
      description="يمكنك إعادة المحاولة دون مغادرة الصفحة."
      onRetry={reset}
    />
  );
}
