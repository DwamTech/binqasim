import Link from "next/link";

import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import {
  getVisualSections,
  getVisuals,
} from "@/features/visuals/application/visuals.service";
import { VisualsListView } from "@/features/visuals/presentation/components/visuals-list-view";
import type {
  VisualListQuery,
  VisualType,
} from "@/features/visuals/domain/visuals.contracts";
import { ErrorState, HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";
export const metadata: Metadata = {
  title: dashboardCopy.modules.visuals.pages.list,
};
import { PageContainer } from "@/shared/components/layout/page-container";

function positiveNumber(value: string | undefined) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function listQuery(
  values: Record<string, string | string[] | undefined>,
): VisualListQuery {
  const type = values.type;
  const query: VisualListQuery = {};
  if (type === "upload" || type === "link") query.type = type as VisualType;
  const sectionId = positiveNumber(
    typeof values.section_id === "string" ? values.section_id : undefined,
  );
  const author = positiveNumber(
    typeof values.author === "string" ? values.author : undefined,
  );
  const page = positiveNumber(
    typeof values.page === "string" ? values.page : undefined,
  );
  if (sectionId !== undefined) query.section_id = sectionId;
  if (author !== undefined) query.author = author;
  if (page !== undefined) query.page = page;
  return query;
}

export default async function VisualsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireDashboardPermission("visuals.manage");
  const query = listQuery(await searchParams);
  const [visuals, sections] = await Promise.all([
    getVisuals(query),
    getVisualSections(),
  ]);
  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.visuals.navigation}
          title={dashboardCopy.modules.visuals.pages.list}
          description="إدارة مقاطع الفيديو والروابط المرئية المنشورة في الموقع."
          actions={
            <Link
              href="/dashboard/visuals/new"
              className="ui-button ui-button--primary ui-focus"
            >
              {dashboardCopy.modules.visuals.pages.create}
            </Link>
          }
        />
      }
    >
      {!visuals.success ? (
        <ErrorState
          title="تعذّر تحميل المرئيات"
          description="حاول إعادة تحميل الصفحة. إذا استمرت المشكلة، تحقق من اتصال الخدمة."
        />
      ) : (
        <VisualsListView
          key={`${query.type ?? "all"}-${query.section_id ?? "all"}-${query.author ?? "all"}-${query.page ?? 1}`}
          paginator={visuals.data}
          sections={sections.success ? sections.data : []}
          query={query}
          sectionsError={!sections.success}
        />
      )}
    </PageContainer>
  );
}
import type { Metadata } from "next";
