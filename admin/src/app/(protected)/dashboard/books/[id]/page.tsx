import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminBookForPresentation } from "@/features/books/application/books.service";
import { BooksDetailView } from "@/features/books/presentation/books-detail-view";
import { readBooksRouteId } from "@/features/books/presentation/books-route.helpers";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
export const metadata: Metadata = {
  title: dashboardCopy.modules.books.pages.detail,
};
export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireDashboardPermission("books.manage");
  const { id } = await params;
  const bookId = readBooksRouteId(id);
  const noticeValue = (await searchParams).notice;
  if (bookId === undefined) notFound();
  const result = await getAdminBookForPresentation(bookId);
  if (!result.success && result.error.status === 404) notFound();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.books.navigation}
          title={dashboardCopy.modules.books.pages.detail}
          description="راجع بيانات الكتاب ومصدره وإحصاءاته والأجزاء المرتبطة به."
        />
      }
    >
      <div dir="rtl">
        {!result.success ? (
          <ErrorState
            title={
              result.error.status === 403
                ? "لا تملك صلاحية عرض هذا الكتاب"
                : "تعذّر تحميل الكتاب"
            }
            description="حاول مرة أخرى لاحقًا."
          />
        ) : (
          <BooksDetailView
            detail={result.data.detail}
            {...(noticeValue === "created" || noticeValue === "updated"
              ? { notice: noticeValue }
              : {})}
            {...(result.data.fileUrl === undefined
              ? {}
              : { fileUrl: result.data.fileUrl })}
          />
        )}
      </div>
    </PageContainer>
  );
}
