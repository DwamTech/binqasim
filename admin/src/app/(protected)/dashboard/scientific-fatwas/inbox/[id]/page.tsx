import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { hasDashboardPermission } from "@/core/authorization/dashboard-access";
import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getFatwaInboxDetail } from "@/features/scientific-fatwas/application/fatwa-inbox.service";
import { FatwaInboxDetailView } from "@/features/scientific-fatwas/presentation/fatwa-inbox-detail-view";
import { ScientificFatwaWorkspaceNav } from "@/features/scientific-fatwas/presentation/scientific-fatwa-workspace-nav";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "مراجعة سؤال الفتوى" };

const notices = ["answered", "updated", "archived", "restored"] as const;

export default async function FatwaInboxDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const actor = await requireDashboardPermission("fatwas.view_details");
  const { id } = await params;
  const result = await getFatwaInboxDetail(id);
  if (!result.success && result.error.status === 404) notFound();
  const rawNotice = (await searchParams).notice;
  const notice = notices.find((candidate) => candidate === rawNotice);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.scientificFatwas.navigation}
          title="مراجعة السؤال والرد"
          description="السؤال والجواب وحالة الظهور وإشعار البريد وسجل الإجراءات في شاشة واحدة."
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
          title="تعذر تحميل السؤال"
          description="تحقق من صلاحية عرض التفاصيل ثم حاول مرة أخرى."
        />
      ) : (
        <FatwaInboxDetailView
          item={result.data}
          capabilities={{
            answer: hasDashboardPermission(actor, "fatwas.answer"),
            updateAnswer: hasDashboardPermission(actor, "fatwas.update_answer"),
            archive: hasDashboardPermission(actor, "fatwas.archive"),
            restore: hasDashboardPermission(actor, "fatwas.restore"),
            privateAnswer: hasDashboardPermission(actor, "fatwas.view_private"),
          }}
          categories={[
            ...result.data.category_options,
            ...(result.data.category_option &&
            !result.data.category_options.some(
              (category) => category.id === result.data.category_option?.id,
            )
              ? [
                  {
                    ...result.data.category_option,
                    is_active: false,
                    sort_order: Number.MAX_SAFE_INTEGER,
                  },
                ]
              : []),
          ]}
          {...(notice ? { notice } : {})}
        />
      )}
    </PageContainer>
  );
}
