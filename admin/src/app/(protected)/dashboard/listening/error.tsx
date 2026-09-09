"use client";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { ErrorState } from "@/shared/components/ui";

export default function ListeningError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title={`حدث خطأ أثناء تحميل ${dashboardCopy.modules.listening.navigation}`}
      description="يمكنك إعادة المحاولة دون مغادرة الصفحة."
      onRetry={reset}
    />
  );
}
