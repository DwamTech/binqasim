"use client";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
export default function BooksError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer>
      <section dir="rtl">
        <ErrorState
          title={`تعذّر فتح ${dashboardCopy.modules.books.navigation}`}
          description="حاول مرة أخرى."
          onRetry={reset}
        />
      </section>
    </PageContainer>
  );
}
