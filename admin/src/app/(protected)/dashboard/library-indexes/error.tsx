"use client";

import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState } from "@/shared/components/ui";

export default function LibraryIndexesError({ reset }: { reset: () => void }) {
  return (
    <PageContainer>
      <ErrorState
        title="تعذر فتح إدارة سجلات المكتبة"
        description="حدث خطأ غير متوقع أثناء تحميل الطلبات."
        onRetry={reset}
      />
    </PageContainer>
  );
}
