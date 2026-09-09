import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBookCreateMetadata } from "@/features/books/application/books.metadata";
import { getAdminBook } from "@/features/books/application/books.service";
import { BookForm } from "@/features/books/presentation/book-form";
import { readBooksRouteId } from "@/features/books/presentation/books-route.helpers";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";

export const metadata: Metadata = {
  title: dashboardCopy.modules.books.pages.edit,
};

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireDashboardPermission("books.manage");
  const id = readBooksRouteId((await params).id);
  if (!id) notFound();
  const [detail, metadata] = await Promise.all([
    getAdminBook(id),
    getBookCreateMetadata(actor),
  ]);
  if (!detail.success && detail.error.status === 404) notFound();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.books.navigation}
          title={dashboardCopy.modules.books.pages.edit}
          description="حدّث البيانات أو استبدل الملفات مع الحفاظ على القيم الحالية."
        />
      }
    >
      {!detail.success || "success" in metadata ? (
        <ErrorState
          title="تعذر تجهيز التعديل"
          description="تعذر تحميل بيانات الكتاب أو قوائم النموذج."
        />
      ) : (
        <BookForm
          initial={detail.data.book}
          catalogs={{
            authors: metadata.authors,
            series: metadata.series,
            sections: metadata.sections,
            sectionsWarning: metadata.sectionsWarning,
          }}
        />
      )}
    </PageContainer>
  );
}
