import type { Metadata } from "next";

import { hasDashboardPermission } from "@/core/authorization/dashboard-access";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  getFatwaInbox,
  getFatwaInboxSummary,
} from "@/features/scientific-fatwas/application/fatwa-inbox.service";
import { normalizeFatwaInboxQuery } from "@/features/scientific-fatwas/infrastructure/fatwa-inbox.query";
import { FatwaInboxListView } from "@/features/scientific-fatwas/presentation/fatwa-inbox-list-view";
import { ScientificFatwaWorkspaceNav } from "@/features/scientific-fatwas/presentation/scientific-fatwa-workspace-nav";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "صندوق أسئلة الفتاوى" };

export default async function FatwaInboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireDashboardPermission("fatwas.view");
  const query = normalizeFatwaInboxQuery(await searchParams);
  const [result, summary] = await Promise.all([
    getFatwaInbox(query),
    getFatwaInboxSummary(),
  ]);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.scientificFatwas.navigation}
          title="صندوق الأسئلة"
          description="راجع الأسئلة الواردة، ورد عليها، وحدد ظهور الإجابة، وتابع إرسال إشعار السائل من دورة عمل واحدة."
          actions={
            <ScientificFatwaWorkspaceNav
              current="inbox"
              canManage={hasDashboardPermission(actor, "fatwas.manage")}
            />
          }
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذر تحميل صندوق الأسئلة"
          description="تحقق من الصلاحية أو اتصال الخدمة ثم حاول مرة أخرى."
        />
      ) : (
        <FatwaInboxListView
          paginator={result.data}
          query={query}
          summary={summary.success ? summary.data : null}
        />
      )}
    </PageContainer>
  );
}
