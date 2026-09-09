import { getBookCreateMetadata } from "@/features/books/application/books.metadata";
import { BookForm } from "@/features/books/presentation/book-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";

export const metadata: Metadata = {
  title: dashboardCopy.modules.books.pages.create,
};

export default async function NewBookPage() {
  const actor = await requireDashboardPermission("books.manage");
  const metadata = await getBookCreateMetadata(actor);
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.books.navigation}
          title={dashboardCopy.modules.books.pages.create}
          description="أدخل بيانات الكتاب وارفع الملف والغلاف ضمن الحدود المعتمدة."
        />
      }
    >
      {"success" in metadata ? (
        <ErrorState
          title="تعذر تجهيز نموذج الكتاب"
          description="تعذر تحميل قوائم المؤلفين أو السلاسل. حاول مرة أخرى."
        />
      ) : (
        <BookForm
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
import type { Metadata } from "next";
