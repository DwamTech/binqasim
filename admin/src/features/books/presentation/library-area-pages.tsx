import Link from "next/link";
import { notFound } from "next/navigation";

import { getBookCreateMetadata } from "../application/books.metadata";
import {
  getAdminBook,
  getAdminBookForPresentation,
  getAdminBooks,
  getLibraryCategories,
} from "../application/books.service";
import { libraryAreas, type LibraryAreaSlug } from "../domain/library-areas";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";
import { BookForm } from "./book-form";
import { BooksDetailView } from "./books-detail-view";
import { BooksListView } from "./books-list-view";
import { LibraryCategoryManager } from "./library-category-manager";
import { readBooksQuery, readBooksRouteId } from "./books-route.helpers";

type SearchParameters = Record<string, string | string[] | undefined>;

function AreaHeroActions({
  area,
  create = true,
}: {
  area: LibraryAreaSlug;
  create?: boolean;
}) {
  const config = libraryAreas[area];
  return (
    <>
      <Link
        href={`${config.basePath}/categories`}
        className="ui-button ui-button--secondary ui-focus"
      >
        {dashboardCopy.modules.sections.navigation}
      </Link>
      {create && (
        <Link
          href={`${config.basePath}/new`}
          className="ui-button ui-button--primary ui-focus"
        >
          إضافة كتاب
        </Link>
      )}
    </>
  );
}

export async function LibraryAreaListPage({
  area,
  searchParams,
}: {
  area: LibraryAreaSlug;
  searchParams: Promise<SearchParameters>;
}) {
  const actor = await requireDashboardPermission("books.manage");
  const config = libraryAreas[area];
  const rawSearchParams = await searchParams;
  const query = { ...readBooksQuery(rawSearchParams), area };
  const [result, metadata] = await Promise.all([
    getAdminBooks(query),
    getBookCreateMetadata(actor, area),
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
          title={config.navigation}
          description={config.description}
          actions={<AreaHeroActions area={area} />}
        />
      }
    >
      <div dir="rtl">
        {!result.success ? (
          <ErrorState
            title={`تعذّر تحميل كتب ${config.title}`}
            description="تحقق من الصلاحية أو اتصال الخدمة."
          />
        ) : (
          <BooksListView
            paginator={result.data}
            query={query}
            series={catalogs.series}
            sections={catalogs.sections}
            deletedNotice={rawSearchParams.notice === "deleted"}
            basePath={config.basePath}
            area={area}
          />
        )}
      </div>
    </PageContainer>
  );
}

export async function LibraryAreaCreatePage({
  area,
}: {
  area: LibraryAreaSlug;
}) {
  const actor = await requireDashboardPermission("books.manage");
  const config = libraryAreas[area];
  const metadata = await getBookCreateMetadata(actor, area);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={config.navigation}
          title={`إضافة كتاب إلى ${config.title}`}
          description="أدخل بيانات الكتاب وحدد القسم الذي سيظهر تحته في الموقع."
          actions={<AreaHeroActions area={area} create={false} />}
        />
      }
    >
      {"success" in metadata ? (
        <ErrorState
          title="تعذر تجهيز نموذج الكتاب"
          description="تعذر تحميل القوائم المساعدة. حاول مرة أخرى."
        />
      ) : (
        <BookForm
          area={area}
          basePath={config.basePath}
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

export async function LibraryAreaDetailPage({
  area,
  params,
  searchParams,
}: {
  area: LibraryAreaSlug;
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireDashboardPermission("books.manage");
  const config = libraryAreas[area];
  const bookId = readBooksRouteId((await params).id);
  if (!bookId) notFound();
  const result = await getAdminBookForPresentation(bookId, area);
  if (!result.success && result.error.status === 404) notFound();
  const notice = (await searchParams).notice;

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={config.navigation}
          title="تفاصيل الكتاب"
          description={`راجع بيانات الكتاب داخل ${config.title}.`}
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذّر تحميل الكتاب"
          description="حاول مرة أخرى لاحقًا."
        />
      ) : (
        <BooksDetailView
          detail={result.data.detail}
          basePath={config.basePath}
          area={area}
          {...(notice === "created" || notice === "updated" ? { notice } : {})}
          {...(result.data.fileUrl ? { fileUrl: result.data.fileUrl } : {})}
        />
      )}
    </PageContainer>
  );
}

export async function LibraryAreaEditPage({
  area,
  params,
}: {
  area: LibraryAreaSlug;
  params: Promise<{ id: string }>;
}) {
  const actor = await requireDashboardPermission("books.manage");
  const config = libraryAreas[area];
  const id = readBooksRouteId((await params).id);
  if (!id) notFound();
  const [detail, metadata] = await Promise.all([
    getAdminBook(id, area),
    getBookCreateMetadata(actor, area),
  ]);
  if (!detail.success && detail.error.status === 404) notFound();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={config.navigation}
          title="تعديل الكتاب"
          description="حدّث البيانات أو انقل الكتاب إلى قسم آخر داخل النطاق نفسه."
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
          area={area}
          basePath={config.basePath}
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

export async function LibraryAreaCategoriesPage({
  area,
}: {
  area: LibraryAreaSlug;
}) {
  await requireDashboardPermission("books.manage");
  const config = libraryAreas[area];
  const result = await getLibraryCategories(area);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={config.navigation}
          title={`أقسام ${config.title}`}
          description="أدر القائمة المنسدلة في الهيدر وحدد ترتيب وظهور كل قسم."
          actions={
            <Link
              href={config.basePath}
              className="ui-button ui-button--secondary ui-focus"
            >
              العودة إلى الكتب
            </Link>
          }
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذر تحميل الأقسام"
          description="تحقق من اتصال الخدمة ثم حاول مرة أخرى."
        />
      ) : (
        <LibraryCategoryManager area={area} initial={result.data.data} />
      )}
    </PageContainer>
  );
}
