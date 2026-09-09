import type { Metadata } from "next";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import {
  getAdminHadithCardProjectDetail,
  getAdminHadithCardProjects,
} from "@/features/hadith-cards/application/hadith-cards.service";
import { HadithCardsWorkspace } from "@/features/hadith-cards/presentation/hadith-cards-workspace";
import { requireDashboardPermission } from "@/server/dal/app-auth-guards";
import { PageContainer } from "@/shared/components/layout/page-container";
import { ErrorState, HeroSection } from "@/shared/components/ui";

export const metadata: Metadata = {
  title: dashboardCopy.modules.hadithCards.navigation,
};

async function getWorkspaceProjects() {
  const firstPage = await getAdminHadithCardProjects({
    page: 1,
    per_page: 100,
  });
  if (!firstPage.success || firstPage.data.meta.last_page <= 1)
    return firstPage;

  const records = [...firstPage.data.data];
  for (let page = 2; page <= firstPage.data.meta.last_page; page += 1) {
    const nextPage = await getAdminHadithCardProjects({ page, per_page: 100 });
    if (!nextPage.success) return nextPage;
    records.push(...nextPage.data.data);
  }

  return {
    ...firstPage,
    data: {
      ...firstPage.data,
      data: records,
      meta: {
        ...firstPage.data.meta,
        current_page: 1,
        last_page: 1,
        per_page: Math.max(records.length, firstPage.data.meta.per_page),
        total: records.length,
      },
    },
  };
}

export default async function HadithCardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireDashboardPermission("hadith_cards.manage");
  const rawSearchParams = await searchParams;
  const result = await getWorkspaceProjects();
  const requestedProjectId =
    typeof rawSearchParams.project_id === "string"
      ? rawSearchParams.project_id
      : undefined;
  const selectedProjectId =
    requestedProjectId ??
    (result.success ? result.data.data[0]?.id : undefined);
  const selectedProject = selectedProjectId
    ? await getAdminHadithCardProjectDetail(selectedProjectId)
    : undefined;

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="المحتوى البصري من السنة النبوية"
          title={dashboardCopy.modules.hadithCards.navigation}
          description="أنشئ أقسام البطاقات، ثم أدر الغلاف وصور الجاليري والنشر من مساحة واحدة واضحة وسريعة."
        />
      }
    >
      {!result.success ? (
        <ErrorState
          title="تعذّر تحميل أقسام البطاقات"
          description="تحقق من صلاحيتك واتصال خدمة إدارة المحتوى ثم أعد المحاولة."
        />
      ) : (
        <HadithCardsWorkspace
          initialProjectPage={result.data}
          {...(selectedProjectId
            ? { initialSelectedProjectId: selectedProjectId }
            : {})}
          {...(selectedProject?.success
            ? { initialSelectedProject: selectedProject.data }
            : {})}
          {...(requestedProjectId && selectedProject && !selectedProject.success
            ? {
                initialNotice:
                  selectedProject.error.status === 404
                    ? "القسم المطلوب غير موجود؛ اختر قسمًا آخر من القائمة."
                    : "تعذّر فتح تفاصيل القسم المطلوب؛ يمكنك إعادة المحاولة من القائمة.",
              }
            : {})}
        />
      )}
    </PageContainer>
  );
}
