import Link from "next/link";
import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { getAdminListeningSessions } from "@/features/listening/application/listening.service";
import { normalizeListeningSessionQuery } from "@/features/listening/infrastructure/listening.query";
import { ListeningSessionsListView } from "@/features/listening/presentation/listening-sessions-list-view";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = { title: "المجالس والتسجيلات الصوتية" };

export default async function ListeningSessionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireDashboardPermission("listening.manage");
  const rawSearchParams = await searchParams;
  const query = normalizeListeningSessionQuery(rawSearchParams);
  const result = await getAdminListeningSessions(query);

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow={dashboardCopy.modules.listening.navigation}
          title="المجالس والتسجيلات الصوتية"
          description="إدارة ترتيب المجالس وبياناتها وتسجيلاتها الصوتية وحالة النشر."
          actions={
            <>
              <Link
                href="/dashboard/listening"
                className="ui-button ui-button--secondary ui-focus"
              >
                إدارة السلاسل
              </Link>
              <Link
                href="/dashboard/listening/sessions/new"
                className="ui-button ui-button--primary ui-focus"
              >
                إضافة مجلس
              </Link>
            </>
          }
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذّر تحميل المجالس والتسجيلات الصوتية"
          description="تحقق من الاتصال بالخدمة ثم حاول مرة أخرى."
        />
      ) : (
        <ListeningSessionsListView
          paginator={result.data}
          query={query}
          deletedNotice={rawSearchParams.notice === "deleted"}
        />
      )}
    </PageContainer>
  );
}
