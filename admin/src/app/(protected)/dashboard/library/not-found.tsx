import Link from "next/link";

import { PageContainer } from "@/shared/components/layout/page-container";
import { EmptyState } from "@/shared/components/ui";

export default function ScientificLibraryNotFound() {
  return (
    <PageContainer>
      <EmptyState
        title="المصنَّف غير موجود"
        description="قد يكون حُذف أو أن الرابط المستخدم غير صحيح."
        action={
          <Link
            href="/dashboard/library"
            className="ui-button ui-button--primary ui-focus"
          >
            العودة إلى المكتبة العلمية
          </Link>
        }
      />
    </PageContainer>
  );
}
