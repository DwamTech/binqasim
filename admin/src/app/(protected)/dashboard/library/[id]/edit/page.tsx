import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  getScientificLibraryItem,
  getScientificLibraryOptions,
} from "@/features/scientific-library/application/scientific-library.service";
import { resolveScientificLibraryOptions } from "@/features/scientific-library/domain/scientific-library.contracts";
import { readScientificLibraryId } from "@/features/scientific-library/infrastructure/scientific-library.query";
import { ScientificLibraryForm } from "@/features/scientific-library/presentation/scientific-library-form";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "تعديل المصنَّف" };

export default async function EditScientificLibraryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardPermission("books.manage");
  const id = readScientificLibraryId((await params).id);
  if (!id) notFound();
  const [itemResult, optionsResult] = await Promise.all([
    getScientificLibraryItem(id),
    getScientificLibraryOptions(),
  ]);
  if (!itemResult.success && itemResult.error.status === 404) notFound();

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.library.navigation}
          title="تعديل المصنَّف"
          description="حدّث البيانات أو استبدل الملف والغلاف مع الحفاظ على المصدر الحالي عند عدم تغييره."
        />
      }
    >
      {!itemResult.success ? (
        <ErrorState
          title="تعذّر تجهيز التعديل"
          description="تعذر تحميل بيانات المصنَّف. حاول مرة أخرى."
        />
      ) : (
        <ScientificLibraryForm
          initial={itemResult.data}
          options={
            optionsResult.success
              ? optionsResult.data
              : resolveScientificLibraryOptions()
          }
          {...(!optionsResult.success
            ? {
                optionsWarning:
                  "تعذر تحديث القوائم؛ تم الحفاظ على القيم الحالية وإضافة القيم الافتراضية.",
              }
            : {})}
        />
      )}
    </PageContainer>
  );
}
