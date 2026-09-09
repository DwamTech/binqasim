import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getLibraryIndexSubmissions } from "@/features/library-indexes/application/library-indexes.service";
import { normalizeLibraryIndexSubmissionsQuery } from "@/features/library-indexes/infrastructure/library-indexes.query";
import { LibraryIndexSubmissionsListView } from "@/features/library-indexes/presentation/library-index-submissions-list-view";
import styles from "@/features/library-indexes/presentation/library-indexes.module.css";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = {
  title: dashboardCopy.modules.libraryIndexes.navigation,
};

export default async function LibraryIndexesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireDashboardPermission("library_indexes.manage");
  const query = normalizeLibraryIndexSubmissionsQuery(await searchParams);
  const result = await getLibraryIndexSubmissions(query);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="طلبات الزوار"
          title={dashboardCopy.modules.libraryIndexes.navigation}
          description="راجع طلبات السجل الذهبي وسجل الضيوف، ثم اعتمد ما سيظهر في جداول الموقع من مساحة عمل واحدة."
          leading={<span className={styles.heroMark}>✦</span>}
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذر تحميل طلبات السجلات"
          description="تحقق من الصلاحية أو اتصال خدمة فهارس المكتبة ثم أعد المحاولة."
        />
      ) : (
        <LibraryIndexSubmissionsListView
          paginator={result.data}
          query={query}
        />
      )}
    </PageContainer>
  );
}
