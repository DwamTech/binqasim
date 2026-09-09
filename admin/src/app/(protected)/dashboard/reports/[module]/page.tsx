import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getEnabledContentViewModuleKeys,
  getModuleReport,
} from "@/features/reports/application/reports.service";
import {
  isReportModuleKey,
  reportModules,
} from "@/features/reports/domain/reports.contracts";
import { ReportsPageView } from "@/features/reports/presentation/reports-page-view";
import { normalizeReportQuery } from "@/features/reports/presentation/reports.query";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";

type Props = {
  params: Promise<{ module: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module } = await params;
  return {
    title: isReportModuleKey(module) ? reportModules[module].title : "التقارير",
  };
}

export default async function ReportModulePage({
  params,
  searchParams,
}: Props) {
  await requireDashboardPermission("reports.view");
  const { module } = await params;
  if (!isReportModuleKey(module)) notFound();

  const query = normalizeReportQuery(await searchParams);
  const report = await getModuleReport(module, query);

  return (
    <PageContainer>
      <ReportsPageView
        definition={reportModules[module]}
        report={report.success ? report.data : null}
        enabledContentViewModules={getEnabledContentViewModuleKeys()}
        query={query}
        unavailable={!report.success}
      />
    </PageContainer>
  );
}
