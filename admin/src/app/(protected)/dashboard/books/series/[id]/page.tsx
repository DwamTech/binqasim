import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminBookSeriesItem } from "@/features/books/application/books.service";
import { readBooksRouteId } from "@/features/books/presentation/books-route.helpers";
import styles from "@/features/books/presentation/books.module.css";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { Card, ErrorState, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
export const metadata: Metadata = {
  title: dashboardCopy.modules.books.series.detail,
};
export default async function SeriesDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardPermission("books.manage");
  const { id } = await params;
  const seriesId = readBooksRouteId(id);
  if (seriesId === undefined) notFound();
  const result = await getAdminBookSeriesItem(seriesId);
  if (!result.success && result.error.status === 404) notFound();
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.books.navigation}
          title={dashboardCopy.modules.books.series.detail}
          description="ملخص واضح لبيانات السلسلة والوصول السريع إلى كتبها."
        />
      }
    >
      <div dir="rtl">
        {!result.success ? (
          <ErrorState
            title={
              result.error.status === 403
                ? "لا تملك صلاحية عرض هذه السلسلة"
                : "تعذّر تحميل السلسلة"
            }
            description="حاول مرة أخرى لاحقًا."
          />
        ) : (
          <Card className={styles.seriesDetailCard ?? ""}>
            <div className={styles.seriesDetailHeader}>
              <span className={styles.seriesMark} aria-hidden="true">
                {result.data.name.slice(0, 1)}
              </span>
              <div>
                <small>سلسلة كتب</small>
                <h2>{result.data.name}</h2>
                <p>
                  {result.data.description || "لا يوجد وصف مضاف لهذه السلسلة."}
                </p>
              </div>
            </div>
            <div className={styles.seriesDetailActions}>
              <Link
                href={`/dashboard/books?series_id=${result.data.id}`}
                className="ui-button ui-button--primary ui-focus"
              >
                عرض كتب السلسلة
              </Link>
              <Link
                href="/dashboard/books/series"
                className="ui-button ui-button--secondary ui-focus"
              >
                العودة إلى السلاسل
              </Link>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
