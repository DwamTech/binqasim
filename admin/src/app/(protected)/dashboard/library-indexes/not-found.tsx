import Link from "next/link";

import { PageContainer } from "@/shared/components/layout/page-container";
import { EmptyState } from "@/shared/components/ui";

export default function LibraryIndexSubmissionNotFound() {
  return (
    <PageContainer>
      <EmptyState
        title="طلب السجل غير موجود"
        description="قد يكون الرابط غير صحيح أو أن الطلب لم يعد متاحًا."
        action={
          <Link
            href="/dashboard/library-indexes"
            className="ui-button ui-button--primary ui-focus"
          >
            العودة إلى طلبات السجلات
          </Link>
        }
      />
    </PageContainer>
  );
}
