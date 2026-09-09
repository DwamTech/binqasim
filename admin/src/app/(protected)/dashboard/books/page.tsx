import Link from "next/link";
import type { Metadata } from "next";
import { getAdminBooks } from "@/features/books/application/books.service";
import { getBookCreateMetadata } from "@/features/books/application/books.metadata";
import { BooksListView } from "@/features/books/presentation/books-list-view";
import { readBooksQuery } from "@/features/books/presentation/books-route.helpers";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
export const metadata: Metadata = {
  title: dashboardCopy.modules.books.pages.list,
};
export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireDashboardPermission("books.manage");
  const rawSearchParams = await searchParams;
  const query = readBooksQuery(rawSearchParams);
  const [result, metadata] = await Promise.all([
    getAdminBooks(query),
    getBookCreateMetadata(actor),
  ]);
  const catalogs =
    "success" in metadata
      ? { series: [], sections: [] }
      : { series: metadata.series, sections: metadata.sections };
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="المكتبة البكرية"
          title={dashboardCopy.modules.books.pages.list}
          description="نظّم الكتب والسلاسل والمصادر من مساحة عمل واضحة وسريعة."
          actions={
            <>
              <Link
                href="/dashboard/books/series"
                className="ui-button ui-button--secondary ui-focus"
              >
                {dashboardCopy.modules.books.series.manage}
              </Link>
              <Link
                href="/dashboard/books/new"
                className="ui-button ui-button--primary ui-focus"
              >
                {dashboardCopy.modules.books.pages.create}
              </Link>
            </>
          }
        />
      }
    >
      <div dir="rtl">
        {!result.success ? (
          <ErrorState
            title="تعذّر تحميل الكتب"
            description="تحقق من الصلاحية أو اتصال الخدمة."
          />
        ) : (
          <BooksListView
            paginator={result.data}
            query={query}
            series={catalogs.series}
            sections={catalogs.sections}
            deletedNotice={rawSearchParams.notice === "deleted"}
          />
        )}
      </div>
    </PageContainer>
  );
}
