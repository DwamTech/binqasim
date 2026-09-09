import Link from "next/link";
import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  getScientificLibraryItems,
  getScientificLibraryOptions,
} from "@/features/scientific-library/application/scientific-library.service";
import { resolveScientificLibraryOptions } from "@/features/scientific-library/domain/scientific-library.contracts";
import { normalizeScientificLibraryQuery } from "@/features/scientific-library/infrastructure/scientific-library.query";
import { ScientificLibraryListView } from "@/features/scientific-library/presentation/scientific-library-list-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = {
  title: dashboardCopy.modules.library.navigation,
};

export default async function ScientificLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireDashboardPermission("books.manage");
  const rawSearchParams = await searchParams;
  const query = normalizeScientificLibraryQuery(rawSearchParams);
  const [itemsResult, optionsResult] = await Promise.all([
    getScientificLibraryItems(query),
    getScientificLibraryOptions(),
  ]);
  const options = optionsResult.success
    ? optionsResult.data
    : resolveScientificLibraryOptions();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="خزانة العلم المكتوبة"
          title={dashboardCopy.modules.library.navigation}
          description="إدارة المصنَّفات وملفات القراءة وبيانات النشر من مساحة مستقلة ومتوافقة مع واجهة الموقع."
          actions={
            <Link
              href="/dashboard/library/new"
              className="ui-button ui-button--primary ui-focus"
            >
              إضافة مصنَّف
            </Link>
          }
        />
      }
    >
      {!itemsResult.success ? (
        <ErrorState
          title="تعذّر تحميل المكتبة العلمية"
          description="تحقق من الصلاحية أو اتصال خدمة المكتبة ثم أعد المحاولة."
        />
      ) : (
        <ScientificLibraryListView
          page={itemsResult.data}
          query={query}
          options={options}
          {...(!optionsResult.success
            ? {
                optionsWarning:
                  "تعذر تحديث القوائم المساندة؛ تُعرض القيم الافتراضية الآمنة مؤقتًا.",
              }
            : {})}
          deletedNotice={rawSearchParams.notice === "deleted"}
        />
      )}
    </PageContainer>
  );
}
