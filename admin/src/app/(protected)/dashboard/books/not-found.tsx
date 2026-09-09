import Link from "next/link";

import { PageContainer } from "@/shared/components/layout/page-container";
import { EmptyState } from "@/shared/components/ui";

export default function BooksNotFound() {
  return (
    <PageContainer>
      <section dir="rtl">
        <EmptyState
          title="العنصر المطلوب غير موجود"
          description="قد يكون قد حُذف أو أن الرابط غير صحيح."
          action={
            <Link
              href="/dashboard/books"
              className="ui-button ui-button--secondary ui-focus"
            >
              العودة إلى الكتب
            </Link>
          }
        />
      </section>
    </PageContainer>
  );
}
