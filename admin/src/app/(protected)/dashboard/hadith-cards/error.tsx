"use client";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { ErrorState } from "@/shared/components/ui";

export default function HadithCardsError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title={`حدث خطأ أثناء تحميل ${dashboardCopy.modules.hadithCards.navigation}`}
      description="يمكنك إعادة المحاولة دون مغادرة مساحة الإدارة."
      onRetry={reset}
    />
  );
}
