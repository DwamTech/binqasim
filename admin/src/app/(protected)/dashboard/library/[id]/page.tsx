import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  getScientificLibraryItem,
  getScientificLibraryOptions,
} from "@/features/scientific-library/application/scientific-library.service";
import { resolveScientificLibraryOptions } from "@/features/scientific-library/domain/scientific-library.contracts";
import { readScientificLibraryId } from "@/features/scientific-library/infrastructure/scientific-library.query";
import { ScientificLibraryDetailView } from "@/features/scientific-library/presentation/scientific-library-detail-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تفاصيل المصنَّف" };

export default async function ScientificLibraryItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireDashboardPermission("books.manage");
  const id = readScientificLibraryId((await params).id);
  if (!id) notFound();
  const [itemResult, optionsResult] = await Promise.all([
    getScientificLibraryItem(id),
    getScientificLibraryOptions(),
  ]);
  if (!itemResult.success && itemResult.error.status === 404) notFound();
  const notice = (await searchParams).notice;

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.library.navigation}
          title="تفاصيل المصنَّف"
          description="راجع بيانات العرض والمصدر وحالة الإتاحة قبل وصوله إلى القراء."
        />
      }
    >
      {!itemResult.success ? (
        <ErrorState
          title="تعذّر تحميل المصنَّف"
          description="حاول مرة أخرى لاحقًا."
        />
      ) : (
        <ScientificLibraryDetailView
          item={itemResult.data}
          options={
            optionsResult.success
              ? optionsResult.data
              : resolveScientificLibraryOptions()
          }
          {...(notice === "created" || notice === "updated" ? { notice } : {})}
        />
      )}
    </PageContainer>
  );
}
