import type { ReactNode } from "react";

import { requireAdmin } from "@/server/dal/app-auth-guards";
import { serverEnv } from "@/core/env/server";
import { getDashboardPendingReviewCounts } from "@/features/dashboard-notifications/application/pending-review-counts.service";

import { ProtectedAdminShell } from "./_components/protected-admin-shell";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();
  const moduleFlags = {
    articles: serverEnv.DASHBOARD_MODULE_ARTICLES_ENABLED,
    pages: serverEnv.DASHBOARD_MODULE_PAGES_ENABLED,
    sections: serverEnv.DASHBOARD_MODULE_SECTIONS_ENABLED,
    governance: serverEnv.DASHBOARD_MODULE_GOVERNANCE_ENABLED,
    programs: serverEnv.DASHBOARD_MODULE_PROGRAMS_ENABLED,
    applications: serverEnv.DASHBOARD_MODULE_APPLICATIONS_ENABLED,
    feedback: serverEnv.DASHBOARD_MODULE_FEEDBACK_ENABLED,
    galleryMedia: serverEnv.DASHBOARD_MODULE_GALLERY_MEDIA_ENABLED,
    legacyVisuals: serverEnv.DASHBOARD_MODULE_LEGACY_VISUALS_ENABLED,
    library: serverEnv.DASHBOARD_MODULE_LIBRARY_ENABLED,
    dissertations: serverEnv.DASHBOARD_MODULE_DISSERTATIONS_ENABLED,
    listening: serverEnv.DASHBOARD_MODULE_LISTENING_ENABLED,
    hadithCards: serverEnv.DASHBOARD_MODULE_HADITH_CARDS_ENABLED,
    scientificFatwas: serverEnv.DASHBOARD_MODULE_SCIENTIFIC_FATWAS_ENABLED,
    scientificVideos: serverEnv.DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_ENABLED,
    libraryIndexes: serverEnv.DASHBOARD_MODULE_LIBRARY_INDEXES_ENABLED,
    comments: serverEnv.DASHBOARD_MODULE_COMMENTS_ENABLED,
    tourGuides: serverEnv.DASHBOARD_MODULE_TOUR_GUIDES_ENABLED,
  } as const;
  const pendingReviewCounts = await getDashboardPendingReviewCounts(
    admin,
    moduleFlags,
  );

  return (
    <ProtectedAdminShell
      admin={admin}
      moduleFlags={moduleFlags}
      pendingReviewCounts={pendingReviewCounts}
    >
      {children}
    </ProtectedAdminShell>
  );
}
